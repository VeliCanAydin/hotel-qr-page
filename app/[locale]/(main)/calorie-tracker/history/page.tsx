'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Award, BarChart2, Coffee } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
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

export default function CalorieHistoryPage() {
    const t = useTranslations('calorie');
    const locale = useLocale();
    const [mounted, setMounted] = useState(false);
    const [dailyLogs, setDailyLogs] = useState<LoggedMeal[]>([]);
    const [dailyGoal, setDailyGoal] = useState<number>(2000);
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setMounted(true);
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
        
        // Seed logs if empty with Friday, Saturday, Sunday data
        if (logs.length === 0) {
            logs = [
                {
                    id: 'seed-1',
                    name: 'Grilled Salmon & Steamed Asparagus',
                    calories: 550,
                    protein: 40,
                    carbs: 10,
                    fat: 22,
                    mealType: 'Dinner',
                    timestamp: '20:15',
                    date: '2026-06-12' // Friday
                },
                {
                    id: 'seed-2',
                    name: 'Mediterranean Chicken Salad',
                    calories: 420,
                    protein: 32,
                    carbs: 12,
                    fat: 15,
                    mealType: 'Lunch',
                    timestamp: '13:30',
                    date: '2026-06-12' // Friday
                },
                {
                    id: 'seed-3',
                    name: 'Avocado Toast & Poached Eggs',
                    calories: 380,
                    protein: 18,
                    carbs: 35,
                    fat: 16,
                    mealType: 'Breakfast',
                    timestamp: '08:45',
                    date: '2026-06-12' // Friday
                },
                {
                    id: 'seed-4',
                    name: 'Classic Club Beef Burger with Fries',
                    calories: 820,
                    protein: 34,
                    carbs: 85,
                    fat: 38,
                    mealType: 'Lunch',
                    timestamp: '14:15',
                    date: '2026-06-13' // Saturday (Today)
                },
                {
                    id: 'seed-5',
                    name: 'Pancakes with Honey & Banana Slice',
                    calories: 480,
                    protein: 10,
                    carbs: 72,
                    fat: 12,
                    mealType: 'Breakfast',
                    timestamp: '09:30',
                    date: '2026-06-14' // Sunday
                },
                {
                    id: 'seed-6',
                    name: 'Cappuccino & Double Chocolate Cookie',
                    calories: 310,
                    protein: 6,
                    carbs: 42,
                    fat: 14,
                    mealType: 'Snack',
                    timestamp: '16:00',
                    date: '2026-06-14' // Sunday
                }
            ];
            localStorage.setItem('guest-calorie-logs', JSON.stringify(logs));
        }

        setDailyLogs(logs);

        if (storedGoal === 'none') {
            setDailyGoal(2000); // fallback value for percentage math logic
        } else if (storedGoal && storedGoal !== 'null') {
            setDailyGoal(Number(storedGoal));
        } else {
            setDailyGoal(2000);
            localStorage.setItem('guest-calorie-goal', '2000');
        }
    }, []);

    if (!mounted) {
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

    // Format YYYY-MM-DD to "Tuesday, June 16, 2026"
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

    // Group logs by date
    const groupedLogs: Record<string, LoggedMeal[]> = {};
    dailyLogs.forEach(log => {
        if (!groupedLogs[log.date]) {
            groupedLogs[log.date] = [];
        }
        groupedLogs[log.date].push(log);
    });

    // Sort dates descending
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
            {sortedDates.length === 0 ? (
                /* Empty state */
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
                /* Chronological date list */
                <div className="flex flex-col gap-5">
                    {sortedDates.map((dateStr) => {
                        const logsForDay = groupedLogs[dateStr];
                        const dayCalories = logsForDay.reduce((sum, item) => sum + item.calories, 0);
                        const dayGoalPercent = Math.min(100, Math.round((dayCalories / dailyGoal) * 100));
                        const isExpanded = !!expandedDates[dateStr];

                        return (
                            <Card key={dateStr} className="border-border rounded-3xl overflow-hidden bg-card shadow-sm transition-all">
                                {/* Date Summary Header Row */}
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

                                    {/* Calorie Stats */}
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col md:items-end">
                                            <div className="flex items-baseline gap-1 text-lg font-black">
                                                <span>{dayCalories}</span>
                                                <span className="text-xs text-muted-foreground font-bold">/ {dailyGoal} kcal</span>
                                            </div>
                                            
                                            {/* Mini progress bar */}
                                            <div className="w-36 h-2 bg-muted rounded-full overflow-hidden mt-1.5">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-sky-400 to-[#45a7d7] rounded-full" 
                                                    style={{ width: `${dayGoalPercent}%` }} 
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Expand Toggle label */}
                                        <Button variant="ghost" size="sm" className="rounded-xl border border-muted text-xs font-bold shrink-0">
                                            {isExpanded ? t('collapse') : t('details')}
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Meals breakdown */}
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
