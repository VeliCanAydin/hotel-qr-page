import { NextRequest, NextResponse } from 'next/server';
import { LOCALES, type Locale } from '@/i18n/routing';

interface AIApiResponse {
    session_id: string;
    message_id: string;
    content: string;
    tokens_used: number;
    cost_usd: number;
    latency_ms: number;
    created_at: string;
}

const MAX_MESSAGE_LENGTH = 2000;
const UPSTREAM_TIMEOUT_MS = 20_000;

// The upstream payload has no system-prompt field, so the reply-language
// instruction rides along with the message (skipped for the English default).
const REPLY_LANGUAGE_INSTRUCTION: Record<Exclude<Locale, 'en'>, string> = {
    tr: '(Lütfen Türkçe yanıt ver.)',
    de: '(Bitte antworte auf Deutsch.)',
    ru: '(Пожалуйста, отвечай по-русски.)',
};

export async function POST(request: NextRequest) {
    try {
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

        // AI API'sine JSON istek at
        const response = await fetch(`${aiBackendUrl}/api/chat/`, {
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
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data: AIApiResponse = await response.json();

        // Maliyet takibi — şimdilik tek gözlemlenebilirlik noktası bu log.
        console.log(
            `[ai-chat] session=${data.session_id} tokens=${data.tokens_used} cost_usd=${data.cost_usd} latency_ms=${data.latency_ms}`
        );

        // API'den gelen yanıtı frontend'e ilet (Cevap ve session_id dahil)
        return NextResponse.json({
            response: data.content,
            imagePath: null,
            sessionId: data.session_id,
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
