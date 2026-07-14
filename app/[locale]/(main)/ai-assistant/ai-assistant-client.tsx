'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Send, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from '@/i18n/navigation';

function AssistantMarkdown({ content }: { content: string }) {
    return (
        <div className="text-sm leading-relaxed [&>*+*]:mt-2">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                    h1: ({ children }) => <h3 className="text-base font-semibold">{children}</h3>,
                    h2: ({ children }) => <h3 className="text-base font-semibold">{children}</h3>,
                    h3: ({ children }) => <h4 className="text-sm font-semibold">{children}</h4>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            {children}
                        </a>
                    ),
                    code: ({ children }) => (
                        <code className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-xs">{children}</code>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_th]:font-semibold">
                                {children}
                            </table>
                        </div>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-foreground/20 pl-3 italic">{children}</blockquote>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    imagePath?: string | null;
    timestamp: Date;
}

export default function AIAssistantClient() {
    const t = useTranslations('ai');
    const locale = useLocale();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        let mounted = true;
        async function checkSession() {
            try {
                const response = await fetch('/api/guest-context');
                const data = await response.json();
                if (mounted) {
                    setIsAuthorized(!!data?.guest);
                }
            } catch {
                if (mounted) {
                    setIsAuthorized(false);
                }
            }
        }
        checkSession();
        return () => {
            mounted = false;
        };
    }, []);

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

        const assistantId = (Date.now() + 1).toString();
        let assistantContent = '';

        // İlk token geldiğinde boş asistan balonu eklenir; sonraki token'lar
        // aynı mesajın içeriğine eklenerek kelime kelime yazma efekti oluşur.
        const appendToAssistant = (text: string) => {
            if (!text) return;
            if (!assistantContent) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: assistantId,
                        role: 'assistant' as const,
                        content: text,
                        timestamp: new Date(),
                    },
                ]);
            } else {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId ? { ...m, content: assistantContent + text } : m
                    )
                );
            }
            assistantContent += text;
        };

        try {
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    sessionId: sessionId,
                    locale: locale,
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error('API request failed');
            }

            // NDJSON akışı: her satır bir event ({type: metadata|token|final|error}).
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let streamErrorContent: string | null = null;

            const handleLine = (line: string) => {
                if (!line.trim()) return;
                let event;
                try {
                    event = JSON.parse(line);
                } catch {
                    return;
                }
                if (event.type === 'token') {
                    appendToAssistant(event.content ?? '');
                } else if (event.type === 'error') {
                    streamErrorContent = event.content || null;
                } else if (event.session_id) {
                    // metadata ve final event'leri session_id taşır
                    setSessionId(event.session_id);
                }
            };

            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                lines.forEach(handleLine);
            }
            handleLine(buffer);

            if (streamErrorContent && !assistantContent) {
                appendToAssistant(streamErrorContent);
            } else if (!assistantContent) {
                appendToAssistant(t('noResponse'));
            }
        } catch (error) {
            console.error('Chat error:', error);

            // Akış yarıda kesildiyse gelen kısmı koru; hiç içerik yoksa hata mesajı göster.
            if (!assistantContent) {
                appendToAssistant(t('errorMessage'));
            }
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

    if (isAuthorized === null) {
        return (
            <div className="fixed inset-0 top-16 flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 top-16 flex flex-col">
            {/* Chat Messages Area - Scrollable */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="h-full">
                    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] text-center space-y-4">
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
                                    <h2 className="text-2xl font-semibold mb-2">{t('title')}</h2>
                                    <p className="text-muted-foreground">
                                        {t('greeting')}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setInput(t('suggestHotelPrompt'))}
                                        disabled={!isAuthorized}
                                    >
                                        {t('suggestHotelLabel')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setInput(t('suggestAvailPrompt'))}
                                        disabled={!isAuthorized}
                                    >
                                        {t('suggestAvailLabel')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setInput(t('suggestRestaurantPrompt'))}
                                        disabled={!isAuthorized}
                                    >
                                        {t('suggestRestaurantLabel')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        {message.role === 'assistant' && (
                                            <Avatar className="w-8 h-8 mt-1 shrink-0">
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
                                            {message.imagePath && (
                                                <div className="mb-3">
                                                    <img
                                                        src={message.imagePath}
                                                        alt={t('imageAlt')}
                                                        className="rounded-lg max-w-full h-auto"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}

                                            {message.role === 'assistant' ? (
                                                <AssistantMarkdown content={message.content} />
                                            ) : (
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            )}
                                            <span className="text-xs opacity-70 mt-2 block">
                                                {message.timestamp.toLocaleTimeString(locale, {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        {message.role === 'user' && (
                                            <Avatar className="w-8 h-8 mt-1 shrink-0">
                                                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                                    {t('you')}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}

                                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                    <div className="flex gap-3 justify-start">
                                        <Avatar className="w-8 h-8 mt-1 shrink-0">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                AI
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="rounded-lg px-4 py-3 bg-muted">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area - Fixed at Bottom */}
            <div className="border-t bg-background shrink-0">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    {isAuthorized ? (
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('placeholder')}
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
                    ) : (
                        <div className="flex items-center justify-center gap-3 py-4 px-6 border-2 border-dashed rounded-2xl bg-muted/5">
                            <Lock className="h-4 w-4 shrink-0 text-[#45a7d7]" />
                            <span className="text-sm text-muted-foreground text-center">
                                {t.rich("lockedNotice", {
                                    link: (chunks) => (
                                        <Link
                                            href="/login?redirect=/ai-assistant"
                                            className="text-foreground font-bold underline underline-offset-2 hover:text-[#45a7d7]"
                                        >
                                            {chunks}
                                        </Link>
                                    ),
                                })}
                            </span>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        {t('disclaimer')}
                    </p>
                </div>
            </div>
        </div>
    );
}
