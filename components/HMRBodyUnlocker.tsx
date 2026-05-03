'use client';

import { useEffect } from 'react';

export function HMRBodyUnlocker() {
    useEffect(() => {
        // Sadece geliştirme ortamında çalışmasını sağlıyoruz
        if (process.env.NODE_ENV === 'development') {
            // HMR ile bileşen yeniden render edildiğinde body üzerindeki kilidi kaldırır
            document.body.style.pointerEvents = '';
        }
    }); // Bağımlılık dizisi (dependency array) bilerek boş bırakılmamıştır, HMR tetiklenmelerini yakalar.

    return null;
}