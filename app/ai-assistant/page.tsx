'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    imagePath?: string | null;
    timestamp: Date;
}

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // API endpoint'inizle değiştirin
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversationHistory: messages,
                }),
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || 'Üzgünüm, bir yanıt oluşturamadım.',
                imagePath: data.imagePath || null,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Chat Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-primary"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">AI Asistan</h2>
                                <p className="text-muted-foreground">
                                    Merhaba! Size nasıl yardımcı olabilirim?
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setInput('Oteliniz hakkında bilgi alabilir miyim?')}
                                >
                                    Otel hakkında bilgi
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setInput('Müsait odalarınız var mı?')}
                                >
                                    Müsaitlik sorgusu
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setInput('Restoranınız hakkında bilgi verir misiniz?')}
                                >
                                    Restoran bilgisi
                                </Button>
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                {message.role === 'assistant' && (
                                    <Avatar className="w-8 h-8 mt-1">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            AI
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={`rounded-lg px-4 py-3 max-w-[80%] ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                        }`}
                                >
                                    {/* Görsel varsa göster */}
                                    {message.imagePath && (
                                        <div className="mb-3">
                                            <img
                                                src={message.imagePath}
                                                alt="AI tarafından oluşturulan görsel"
                                                className="rounded-lg max-w-full h-auto"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}

                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <span className="text-xs opacity-70 mt-2 block">
                                        {message.timestamp.toLocaleTimeString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>

                                {message.role === 'user' && (
                                    <Avatar className="w-8 h-8 mt-1">
                                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                            SİZ
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <Avatar className="w-8 h-8 mt-1">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    AI
                                </AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg px-4 py-3 bg-muted">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-background">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Mesajınızı yazın... (Enter ile gönder, Shift+Enter ile yeni satır)"
                            className="min-h-[60px] max-h-[200px] resize-none"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-[60px] w-[60px] shrink-0"
                            disabled={!input.trim() || isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </form>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        AI asistan yanıtları yanlış olabilir. Önemli bilgiler için doğrulama yapın.
                    </p>
                </div>
            </div>
        </div>
    );
}
