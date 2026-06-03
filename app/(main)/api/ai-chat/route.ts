import { NextRequest, NextResponse } from 'next/server';

interface AIApiResponse {
    session_id: string;
    message_id: string;
    content: string;
    tokens_used: number;
    cost_usd: number;
    latency_ms: number;
    created_at: string;
}

export async function POST(request: NextRequest) {
    try {
        const { message, sessionId } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Mesaj gerekli' },
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
                message: message,
                session_id: sessionId || null,
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data: AIApiResponse = await response.json();

        // API'den gelen yanıtı frontend'e ilet (Cevap ve session_id dahil)
        return NextResponse.json({
            response: data.content,
            imagePath: null,
            sessionId: data.session_id,
        });

    } catch (error) {
        console.error('AI Chat API Error:', error);

        return NextResponse.json(
            {
                error: 'AI servisi ile bağlantı kurulamadı. Lütfen tekrar deneyin.',
                details: error instanceof Error ? error.message : 'Bilinmeyen hata'
            },
            { status: 500 }
        );
    }
}

