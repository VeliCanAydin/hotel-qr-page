import { NextRequest, NextResponse } from 'next/server';
import { LOCALES, type Locale } from '@/i18n/routing';
import { verifySession } from '@/lib/auth';

const MAX_MESSAGE_LENGTH = 2000;
// Yanıt stream edildiği için timeout yalnızca bağlantı kurulumunu (ilk byte'a kadar) korur.
const UPSTREAM_CONNECT_TIMEOUT_MS = 30_000;

// The upstream payload has no system-prompt field, so the reply-language
// instruction rides along with the message (skipped for the English default).
const REPLY_LANGUAGE_INSTRUCTION: Record<Exclude<Locale, 'en'>, string> = {
    tr: '(Lütfen Türkçe yanıt ver.)',
    de: '(Bitte antworte auf Deutsch.)',
    ru: '(Пожалуйста, отвечай по-русски.)',
};

// Upstream NDJSON akışını değiştirmeden geçirir; yalnızca "final" satırını
// yakalayıp maliyet logu atar (şimdilik tek gözlemlenebilirlik noktası bu log).
function createCostLoggingPassthrough() {
    const decoder = new TextDecoder();
    let buffer = '';

    const inspectLine = (line: string) => {
        if (!line.trim()) return;
        try {
            const event = JSON.parse(line);
            if (event.type === 'final') {
                console.log(
                    `[ai-chat] session=${event.session_id} tokens=${event.tokens_used} cost_usd=${event.cost_usd} latency_ms=${event.latency_ms}`
                );
            } else if (event.type === 'error') {
                console.error('[ai-chat] upstream stream error event:', event.content);
            }
        } catch {
            // Log satırı parse edilemese de akış bozulmamalı.
        }
    };

    return new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
            controller.enqueue(chunk);
            buffer += decoder.decode(chunk, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            lines.forEach(inspectLine);
        },
        flush() {
            inspectLine(buffer);
        },
    });
}

export async function POST(request: NextRequest) {
    try {
        // Security: Ensure the request comes from an authenticated guest or staff session
        const session = await verifySession();
        if (!session) {
            return NextResponse.json(
                { error: 'Oturum açılması gerekmektedir.' },
                { status: 401 }
            );
        }

        const { message, sessionId, locale: rawLocale } = await request.json();


        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Mesaj gerekli' },
                { status: 400 }
            );
        }

        // Guest UI always sends the URL locale; anything else is rejected.
        if (rawLocale !== undefined && !LOCALES.includes(rawLocale)) {
            return NextResponse.json(
                { error: 'Geçersiz dil' },
                { status: 400 }
            );
        }
        const locale: Locale = rawLocale ?? 'en';

        if (message.length > MAX_MESSAGE_LENGTH) {
            return NextResponse.json(
                { error: `Mesaj en fazla ${MAX_MESSAGE_LENGTH} karakter olabilir` },
                { status: 400 }
            );
        }

        const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:8000';

        // Bağlantı timeout'u: yanıt başlıkları gelince iptal edilir ki akış kesilmesin.
        const abortController = new AbortController();
        const connectTimer = setTimeout(
            () => abortController.abort(),
            UPSTREAM_CONNECT_TIMEOUT_MS
        );

        let response: Response;
        try {
            response = await fetch(`${aiBackendUrl}/api/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message:
                        locale === 'en'
                            ? message
                            : `${message}\n\n${REPLY_LANGUAGE_INSTRUCTION[locale]}`,
                    session_id: sessionId || null,
                    locale,
                }),
                signal: abortController.signal,
            });
        } finally {
            clearTimeout(connectTimer);
        }

        if (!response.ok || !response.body) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        // NDJSON akışını frontend'e olduğu gibi ilet.
        return new Response(response.body.pipeThrough(createCostLoggingPassthrough()), {
            headers: {
                'Content-Type': 'application/x-ndjson; charset=utf-8',
                'Cache-Control': 'no-store',
            },
        });

    } catch (error) {
        console.error('AI Chat API Error:', error);

        if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
            return NextResponse.json(
                { error: 'AI servisi zamanında yanıt vermedi. Lütfen tekrar deneyin.' },
                { status: 504 }
            );
        }

        return NextResponse.json(
            {
                error: 'AI servisi ile bağlantı kurulamadı. Lütfen tekrar deneyin.',
                details: error instanceof Error ? error.message : 'Bilinmeyen hata'
            },
            { status: 500 }
        );
    }
}
