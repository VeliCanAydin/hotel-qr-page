'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Award, BarChart2, Coffee, Lock } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';

interface LoggedMeal {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    timestamp: string;
    date: string;
}

export default function CalorieHistoryClient() {
    const t = useTranslations('calorie');
    const locale = useLocale();
    const [mounted, setMounted] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [dailyLogs, setDailyLogs] = useState<LoggedMeal[]>([]);
    const [dailyGoal, setDailyGoal] = useState<number>(2000);
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        let mountedActive = true;
        setMounted(true);

        async function checkSession() {
            try {
                const response = await fetch('/api/guest-context');
                const data = await response.json();
                if (mountedActive) {
                    setIsAuthorized(!!data?.guest);
                }
            } catch {
                if (mountedActive) {
                    setIsAuthorized(false);
                }
            }
        }
        checkSession();

        const storedLogs = localStorage.getItem('guest-calorie-logs');
        const storedGoal = localStorage.getItem('guest-calorie-goal');
        
        let logs: LoggedMeal[] = [];
        if (storedLogs) {
            try {
                logs = JSON.parse(storedLogs);
            } catch (e) {
                console.error(e);
            }
        }

        setDailyLogs(logs);

        if (storedGoal === 'none') {
            setDailyGoal(2000);
        } else if (storedGoal && storedGoal !== 'null') {
            setDailyGoal(Number(storedGoal));
        } else {
            setDailyGoal(2000);
            localStorage.setItem('guest-calorie-goal', '2000');
        }

        return () => {
            mountedActive = false;
        };
    }, []);

    if (!mounted || isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleToggleExpand = (date: string) => {
        setExpandedDates(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };

    const formatDateLabel = (dateStr: string) => {
        try {
            const dateParts = dateStr.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            const dateObj = new Date(year, month, day);
            
            return dateObj.toLocaleDateString(locale, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const groupedLogs: Record<string, LoggedMeal[]> = {};
    dailyLogs.forEach(log => {
        if (!groupedLogs[log.date]) {
            groupedLogs[log.date] = [];
        }
        groupedLogs[log.date].push(log);
    });

    const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-4 pb-24 text-foreground">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b pb-6">
                <div className="flex items-center gap-3">
                    <Link href="/calorie-tracker" passHref>
                        <Button variant="outline" size="icon" className="rounded-full border border-muted h-10 w-10">
                            <ArrowLeft className="w-5 h-5 text-primary" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{t('historyTitle')}</h1>
                        <p className="text-muted-foreground text-sm">{t('historySubtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Content list */}
            {!isAuthorized ? (
                <Card className="border-border rounded-3xl p-8 text-center bg-card shadow-sm max-w-lg mx-auto w-full">
                    <CardHeader className="flex flex-col items-center justify-center gap-3 pb-3">
                        <div className="p-4 rounded-full bg-muted text-muted-foreground/60 animate-[pulse_3s_infinite_ease-in-out]">
                            <Lock className="w-10 h-10 text-[#45a7d7]" />
                        </div>
                        <CardTitle className="text-xl font-bold">{t('historyTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 items-center">
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            {t.rich("historyLockedNotice", {
                                link: (chunks) => (
                                    <Link
                                        href="/login?redirect=/calorie-tracker/history"
                                        className="text-foreground font-bold underline underline-offset-2 hover:text-[#45a7d7]"
                                    >
                                        {chunks}
                                    </Link>
                                ),
                            })}
                        </p>
                    </CardContent>
                </Card>
            ) : sortedDates.length === 0 ? (
                <Card className="border-border rounded-3xl p-8 text-center bg-card shadow-sm max-w-lg mx-auto w-full">
                    <CardHeader className="flex flex-col items-center justify-center gap-3 pb-3">
                        <div className="p-4 rounded-full bg-muted text-muted-foreground/60">
                            <Calendar className="w-10 h-10" />
                        </div>
                        <CardTitle className="text-xl font-bold">{t('noHistory')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 items-center">
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            {t('noHistoryDesc')}
                        </p>
                        <Link href="/calorie-tracker" passHref>
                            <Button className="bg-[#45a7d7] text-white hover:bg-[#45a7d7]/95 rounded-2xl font-bold px-6 py-2 text-sm mt-2">
                                {t('goToTracker')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-5">
                    {sortedDates.map((dateStr) => {
                        const logsForDay = groupedLogs[dateStr];
                        const dayCalories = logsForDay.reduce((sum, item) => sum + item.calories, 0);
                        const dayGoalPercent = Math.min(100, Math.round((dayCalories / dailyGoal) * 100));
                        const isExpanded = !!expandedDates[dateStr];

                        return (
                            <Card key={dateStr} className="border-border rounded-3xl overflow-hidden bg-card shadow-sm transition-all">
                                <div 
                                    onClick={() => handleToggleExpand(dateStr)}
                                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 transition select-none"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="p-2.5 rounded-2xl bg-[#45a7d7]/10 text-[#45a7d7]">
                                            <Calendar className="w-5.5 h-5.5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-lg">{formatDateLabel(dateStr)}</span>
                                            <span className="text-xs text-muted-foreground font-semibold">{t('mealsLogged', { count: logsForDay.length })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col md:items-end">
                                            <div className="flex items-baseline gap-1 text-lg font-black">
                                                <span>{dayCalories}</span>
                                                <span className="text-xs text-muted-foreground font-bold">/ {dailyGoal} kcal</span>
                                            </div>
                                            
                                            <div className="w-36 h-2 bg-muted rounded-full overflow-hidden mt-1.5">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-sky-400 to-[#45a7d7] rounded-full" 
                                                    style={{ width: `${dayGoalPercent}%` }} 
                                                />
                                            </div>
                                        </div>
                                        
                                        <Button variant="ghost" size="sm" className="rounded-xl border border-muted text-xs font-bold shrink-0">
                                            {isExpanded ? t('collapse') : t('details')}
                                        </Button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t bg-muted/5 divide-y animate-[fadeIn_0.2s_ease-out]">
                                        {logsForDay.map((log) => (
                                            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-card border rounded-xl shrink-0">
                                                        <Coffee className="w-4.5 h-4.5 text-orange-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-foreground">{log.name}</span>
                                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                                                            <span className="px-1.5 py-0.5 rounded bg-muted text-primary">{t(`mealTypes.${log.mealType}`)}</span>
                                                            <span>{log.timestamp}</span>
                                                            {log.protein > 0 && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>P: {log.protein}g C: {log.carbs}g F: {log.fat}g</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black">{log.calories} kcal</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
