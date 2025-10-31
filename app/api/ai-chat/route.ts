import { NextRequest, NextResponse } from 'next/server';

interface AIApiResponse {
    user_text: string;
    bot_response: string;
    image_path: string | null;
}

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Mesaj gerekli' },
                { status: 400 }
            );
        }

        // FormData oluştur
        const formData = new FormData();
        formData.append('text', message);

        // AI API'sine istek at
        const response = await fetch('http://51.77.203.172:83/api/forward-message/', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data: AIApiResponse = await response.json();

        // API'den gelen yanıtı frontend'e ilet
        return NextResponse.json({
            response: data.bot_response,
            imagePath: data.image_path,
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
