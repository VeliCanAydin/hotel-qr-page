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
        const { message, sessionId, image_base64, image_url, has_image } = await request.json();

        // Allow query to go through with empty text if an image is provided
        if (!has_image && (!message || typeof message !== 'string')) {
            return NextResponse.json(
                { error: 'Message or image is required' },
                { status: 400 }
            );
        }

        const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:8000';

        // POST request to FastAPI AI Backend
        const response = await fetch(`${aiBackendUrl}/api/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message || 'Bu yemeğin kalorisini hesapla.',
                session_id: sessionId || null,
                image_base64: image_base64 || null,
                image_url: image_url || null,
                has_image: !!has_image,
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data: AIApiResponse = await response.json();

        // Forward response to the frontend client
        return NextResponse.json({
            response: data.content,
            imagePath: null,
            sessionId: data.session_id,
        });

    } catch (error) {
        console.error('AI Calorie Vision API Error:', error);

        return NextResponse.json(
            {
                error: 'Could not connect to AI Vision service. Please try again.',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
