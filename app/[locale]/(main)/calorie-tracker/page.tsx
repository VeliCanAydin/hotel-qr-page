'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Flame, Upload, Camera, Trash2, Check, Sparkles, AlertCircle, RefreshCw, BarChart2, Info, ArrowLeft, History, Edit3, X } from 'lucide-react';
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
    date: string; // YYYY-MM-DD local format
}

interface DetectedFoodItem {
    food_name: string;
    food_name_en?: string | null;
    estimated_weight_g?: number | null;
    portion_description?: string | null;
    confidence: number;
    usda_verified: boolean;
    nutrition?: {
        calories_kcal: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
        fiber_g?: number | null;
        sugar_g?: number | null;
        sodium_mg?: number | null;
        saturated_fat_g?: number | null;
    } | null;
}

interface ConfidenceInterval {
    min_calories: number;
    max_calories: number;
    overall_confidence: number;
    confidence_label: string; // 'Yüksek' | 'Orta' | 'Düşük'
}

interface MealAnalysis {
    // Görüntüde tespit edilen her bir yemek
    detected_foods: DetectedFoodItem[];
    // Toplam besin değerleri
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number | null;
    sugar?: number | null;
    sodium?: number | null;
    saturated_fat?: number | null;
    // Meta
    mealName: string;       // İlk yemeğin adı (veya birleşik liste)
    portion: string;        // İlk yemeğin porsiyon açıklaması
    note?: string | null;
    confidence_interval?: ConfidenceInterval;
    model_used?: string;
}

export default function CalorieTrackerPage() {
    const [mounted, setMounted] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
    
    // Daily log states
    const [dailyLogs, setDailyLogs] = useState<LoggedMeal[]>([]);
    const [dailyGoal, setDailyGoal] = useState<number | null>(null); // null means no target set
    const [selectedMealType, setSelectedMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
    
    // Goal editing states
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [goalInputValue, setGoalInputValue] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get current local date string (YYYY-MM-DD) safely
    const getLocalDateString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Set after mount: prerendered HTML can't read the current clock
    const [todayStr, setTodayStr] = useState('');

    useEffect(() => {
        setMounted(true);
        setTodayStr(getLocalDateString());
        // Load data from localStorage
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
        
        // Seed database if empty with Friday, Saturday, Sunday data
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
            setDailyGoal(null);
            setGoalInputValue('');
        } else if (storedGoal && storedGoal !== 'null') {
            setDailyGoal(Number(storedGoal));
            setGoalInputValue(storedGoal);
        } else {
            // First load ever: Seed a default goal of 2000
            setDailyGoal(2000);
            setGoalInputValue('2000');
            localStorage.setItem('guest-calorie-goal', '2000');
        }
    }, []);

    // Save states to localstorage
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('guest-calorie-logs', JSON.stringify(dailyLogs));
    }, [dailyLogs, mounted]);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('guest-calorie-goal', dailyGoal !== null ? dailyGoal.toString() : 'none');
    }, [dailyGoal, mounted]);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Helper to read file to base64
    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64Str = result.split(',')[1];
                resolve(base64Str);
            };
            reader.onerror = error => reject(error);
        });
    };

    // Handle Image Selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file.');
                return;
            }
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setSelectedImage(previewUrl);
            setAnalysisResult(null); // Reset analysis on new image
        }
    };

    // Trigger AI Vision Request to proxy endpoint
    const handleAnalyze = async () => {
        if (!imageFile) {
            toast.error('Please choose or capture an image first.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const base64Data = await getBase64(imageFile);

            const response = await fetch('/api/calorie-vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_base64: base64Data,
                    image_mime_type: imageFile.type || 'image/jpeg',
                    language: 'tr',
                }),
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                throw new Error(errBody?.error || `Sunucu hatası: ${response.status}`);
            }

            // FastAPI /api/v1/analyze'den gelen yapılandırılmış JSON
            const data = await response.json();

            if (!data.total_nutrition) {
                throw new Error('AI geçersiz bir yanıt döndürdü.');
            }

            const total = data.total_nutrition;
            const foods: DetectedFoodItem[] = data.detected_foods ?? [];

            // Yemek adını birleştir (birden fazla yiyecek varsa)
            const mealName = foods.length > 0
                ? foods.map((f: DetectedFoodItem) => f.food_name).join(', ')
                : 'Bilinmeyen Yemek';

            // İlk yemeğin porsiyon açıklaması
            const portion = foods[0]?.portion_description ?? '1 Porsiyon';

            setAnalysisResult({
                detected_foods: foods,
                calories: Math.round(total.calories_kcal),
                protein: Math.round(total.protein_g),
                carbs: Math.round(total.carbs_g),
                fat: Math.round(total.fat_g),
                fiber: total.fiber_g != null ? Math.round(total.fiber_g) : null,
                sugar: total.sugar_g != null ? Math.round(total.sugar_g) : null,
                sodium: total.sodium_mg != null ? Math.round(total.sodium_mg) : null,
                saturated_fat: total.saturated_fat_g != null ? Math.round(total.saturated_fat_g) : null,
                mealName,
                portion,
                note: data.analysis_notes ?? null,
                confidence_interval: data.confidence_interval ?? null,
                model_used: data.model_used ?? null,
            });

            toast.success('Yemek tabağı başarıyla analiz edildi!');

        } catch (error) {
            console.error('Analysis failed:', error);
            toast.error(error instanceof Error ? error.message : 'Analiz başarısız. Backend bağlantısını kontrol edin.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Log the result to storage history
    const handleLogToHistory = () => {
        if (!analysisResult) return;

        const newLog: LoggedMeal = {
            id: Date.now().toString(),
            name: analysisResult.mealName,
            calories: analysisResult.calories || 250,
            protein: analysisResult.protein || 0,
            carbs: analysisResult.carbs || 0,
            fat: analysisResult.fat || 0,
            mealType: selectedMealType,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            date: todayStr
        };

        setDailyLogs(prev => [newLog, ...prev]);
        toast.success(`Logged ${newLog.calories} kcal to ${selectedMealType}!`);
        
        // Reset analysis states to allow new scan
        setSelectedImage(null);
        setImageFile(null);
        setAnalysisResult(null);
    };

    const handleReset = () => {
        setSelectedImage(null);
        setImageFile(null);
        setAnalysisResult(null);
    };

    // Goal handlers
    const handleSaveGoal = () => {
        const parsed = parseInt(goalInputValue);
        if (isNaN(parsed) || parsed <= 0) {
            toast.error('Please enter a valid calorie target number.');
            return;
        }
        setDailyGoal(parsed);
        setIsEditingGoal(false);
        toast.success(`Daily calorie target set to ${parsed} kcal!`);
    };

    const handleRemoveGoal = () => {
        setDailyGoal(null);
        setGoalInputValue('');
        setIsEditingGoal(false);
        toast.info('Daily calorie target removed.');
    };

    // Log calculation metrics based ONLY on today's logs
    const todayLogs = dailyLogs.filter(log => log.date === todayStr);
    const totalConsumed = todayLogs.reduce((sum, item) => sum + item.calories, 0);
    
    // Percent & progress metrics when dailyGoal is set
    const progressPercent = dailyGoal ? Math.min(100, Math.round((totalConsumed / dailyGoal) * 100)) : 0;

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 pb-24 text-foreground transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-950/40 rounded-2xl">
                            <Flame className="w-7 h-7 text-orange-500 fill-orange-500" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">AI Calorie Tracker</h1>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        {analysisResult && (
                            <Button variant="ghost" size="sm" onClick={handleReset} className="rounded-xl border flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" /> Reset
                            </Button>
                        )}
                        <Link href="/calorie-tracker/history" passHref>
                            <Button variant="outline" size="sm" className="rounded-xl border flex items-center gap-1.5 hover:bg-muted font-bold">
                                <History className="w-4 h-4 text-primary" /> View History
                            </Button>
                        </Link>
                    </div>
                </div>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Snap a photo of your dining plate to estimate calories and nutrition metrics automatically using advanced AI vision processing.
                </p>
            </div>

            {/* PROGRESSIVE LAYOUT DESIGN */}
            {!analysisResult ? (
                /* Initial State: Only Image Upload Area (Centered & Simple) */
                <div className="max-w-xl mx-auto w-full transition-all duration-300">
                    <Card className="border-border rounded-3xl shadow-sm overflow-hidden bg-card">
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl font-bold">Upload Food Photo</CardTitle>
                            <CardDescription>Select an image of your meal plate to analyze calories.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-5">
                            {/* Upload Area */}
                            <div 
                                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-3xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px] ${
                                    selectedImage 
                                        ? 'border-primary/20 bg-muted/10' 
                                        : 'border-muted hover:border-[#45a7d7] bg-muted/5 hover:bg-[#45a7d7]/5'
                                }`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageChange} 
                                    accept="image/*" 
                                    className="hidden" 
                                    disabled={isAnalyzing}
                                />

                                {selectedImage ? (
                                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-inner group">
                                        <img 
                                            src={selectedImage} 
                                            alt="Food Preview" 
                                            className="w-full h-full object-cover" 
                                        />
                                        
                                        {/* Scanning Animation line overlay */}
                                        {isAnalyzing && (
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#45a7d7]/30 to-transparent flex flex-col justify-between">
                                                <div 
                                                    className="w-full h-1.5 bg-[#45a7d7] shadow-[0_0_15px_#45a7d7] animate-[bounce_2.5s_infinite]"
                                                    style={{ animationTimingFunction: 'linear' }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm font-semibold gap-2">
                                                    <RefreshCw className="w-5 h-5 animate-spin text-[#45a7d7]" />
                                                    Scanning meal plate...
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-3 text-center p-4">
                                        <div className="p-4 rounded-full bg-[#45a7d7]/10 text-[#45a7d7]">
                                            <Camera className="w-8 h-8" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-sm">Upload Food Photo</span>
                                            <span className="text-xs text-muted-foreground">Take a picture or drop a file here</span>
                                        </div>
                                        <Button variant="outline" size="sm" className="mt-2 rounded-xl border-muted">
                                            Choose File
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Button actions */}
                            {selectedImage && !isAnalyzing && (
                                <div className="flex gap-3">
                                    <Button 
                                        onClick={handleReset}
                                        variant="outline" 
                                        className="flex-1 rounded-2xl font-bold border-muted"
                                    >
                                        Change Photo
                                    </Button>
                                    <Button 
                                        onClick={handleAnalyze}
                                        className="flex-1 bg-[#45a7d7] text-white hover:bg-[#45a7d7]/95 rounded-2xl font-bold gap-2"
                                    >
                                        <Sparkles className="w-4 h-4 fill-white" />
                                        Analyze Meal
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Results State: Image & Analysis Breakdown side-by-side */
                <div className="grid gap-8 md:grid-cols-2 items-start animate-[fadeIn_0.4s_ease-out]">
                    
                    {/* Left Column: Food Image Preview */}
                    <div className="flex flex-col gap-4">
                        <Card className="border-border rounded-3xl overflow-hidden bg-card">
                            <div className="relative w-full aspect-video">
                                <img 
                                    src={selectedImage!} 
                                    alt="Analyzed Food" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <CardContent className="p-4 flex gap-3">
                                <Button variant="outline" onClick={handleReset} className="w-full rounded-2xl border-muted font-bold">
                                    Scan Another Plate
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Nutrition Results */}
                    <Card className="border-border rounded-3xl shadow-sm bg-card flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-[#45a7d7]" /> Nutritional Breakdown
                            </CardTitle>
                            <CardDescription>AI vision estimates of your plate contents.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-6">
                            {/* Meal Name + Calorie Badge */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#45a7d7] uppercase tracking-wider">Tespit Edilen Yemek</span>
                                    <h3 className="text-2xl font-black text-foreground mt-0.5">{analysisResult.mealName}</h3>
                                    <span className="text-xs text-muted-foreground mt-0.5">Porsiyon: {analysisResult.portion}</span>
                                </div>
                                <div className="p-4 bg-orange-100/80 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-3xl flex flex-col items-center justify-center min-w-[100px] border border-orange-200/50">
                                    <span className="text-2xl font-extrabold">{analysisResult.calories}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">kcal</span>
                                </div>
                            </div>

                            {/* Makro Besin Progress Barlar */}
                            <div className="flex flex-col gap-3 border-t pt-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Makro Besinler</h4>

                                {/* Protein */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span>Protein 🥩</span>
                                        <span>{analysisResult.protein}g</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (analysisResult.protein / 50) * 100)}%` }} />
                                    </div>
                                </div>

                                {/* Karbonhidrat */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span>Karbonhidrat 🥖</span>
                                        <span>{analysisResult.carbs}g</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (analysisResult.carbs / 100) * 100)}%` }} />
                                    </div>
                                </div>

                                {/* Yağ */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span>Yağ 🥑</span>
                                        <span>{analysisResult.fat}g</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (analysisResult.fat / 40) * 100)}%` }} />
                                    </div>
                                </div>

                                {/* Lif (opsiyonel) */}
                                {analysisResult.fiber != null && (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span>Lif 🌿</span>
                                            <span>{analysisResult.fiber}g</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (analysisResult.fiber / 30) * 100)}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Ek bilgiler (şeker, sodyum) */}
                            {(analysisResult.sugar != null || analysisResult.sodium != null) && (
                                <div className="flex gap-3 text-xs">
                                    {analysisResult.sugar != null && (
                                        <div className="flex-1 p-2.5 bg-muted/30 rounded-2xl border text-center">
                                            <span className="block font-bold text-foreground">{analysisResult.sugar}g</span>
                                            <span className="text-muted-foreground">Şeker</span>
                                        </div>
                                    )}
                                    {analysisResult.sodium != null && (
                                        <div className="flex-1 p-2.5 bg-muted/30 rounded-2xl border text-center">
                                            <span className="block font-bold text-foreground">{analysisResult.sodium}mg</span>
                                            <span className="text-muted-foreground">Sodyum</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Güven aralığı */}
                            {analysisResult.confidence_interval && (
                                <div className="p-3 bg-muted/30 border rounded-2xl text-xs flex items-center justify-between">
                                    <span className="text-muted-foreground font-semibold">Kalori Aralığı</span>
                                    <span className="font-bold text-foreground">
                                        {analysisResult.confidence_interval.min_calories}–{analysisResult.confidence_interval.max_calories} kcal
                                        <span className={`ml-2 px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${
                                            analysisResult.confidence_interval.confidence_label === 'Yüksek'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : analysisResult.confidence_interval.confidence_label === 'Orta'
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            {analysisResult.confidence_interval.confidence_label}
                                        </span>
                                    </span>
                                </div>
                            )}

                            {/* Analiz notu */}
                            {analysisResult.note && (
                                <div className="p-3 bg-muted/40 border rounded-2xl flex items-start gap-2.5 text-xs text-muted-foreground">
                                    <AlertCircle className="w-4.5 h-4.5 text-[#45a7d7] shrink-0 mt-0.5" />
                                    <p className="leading-relaxed"><strong className="text-foreground font-semibold">Not:</strong> {analysisResult.note}</p>
                                </div>
                            )}

                            {/* Action logger to daily history */}
                            <div className="border-t pt-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground font-semibold">Log into meal slot:</span>
                                    <div className="flex gap-1">
                                        {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedMealType(type)}
                                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
                                                    selectedMealType === type
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted hover:bg-muted-hover text-muted-foreground'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleLogToHistory}
                                    className="w-full bg-[#45a7d7] text-white hover:bg-[#45a7d7]/95 rounded-2xl font-bold py-2 flex items-center justify-center gap-1.5 text-sm"
                                >
                                    <Check className="w-4 h-4" />
                                    Add to Daily Log
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Daily Tracker Log - Only visible if there are logs for today or if a meal was analyzed */}
            {(todayLogs.length > 0 || analysisResult) && (
                <div className="flex flex-col gap-6 border-t pt-8 animate-[fadeIn_0.5s_ease-out] max-w-xl mx-auto w-full">
                    {/* Goal Progress Gauge (Centered Full Width) */}
                    <Card className="border-border rounded-3xl shadow-sm bg-card w-full">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
                                Today's Calories
                            </CardTitle>
                            
                            {/* Toggle/Edit Target Action link (Shows "Set Target" if no target exists) */}
                            {!isEditingGoal && (
                                <button 
                                    onClick={() => setIsEditingGoal(true)}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    <Edit3 className="w-3.5 h-3.5" /> {dailyGoal === null ? 'Set Target' : 'Edit Target'}
                                </button>
                            )}
                        </CardHeader>
                        
                        <CardContent className="flex flex-col gap-4">
                            {/* IF NO TARGET IS SET */}
                            {dailyGoal === null ? (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                                    <div className="flex flex-col gap-0.5 text-center sm:text-left">
                                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Consumed</span>
                                        <span className="text-3xl font-black">{totalConsumed} <span className="text-sm font-bold text-muted-foreground">kcal</span></span>
                                    </div>
                                    
                                    {/* Set Goal Inline Input Form */}
                                    {isEditingGoal && (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <input 
                                                type="number"
                                                placeholder="e.g. 2000"
                                                value={goalInputValue}
                                                onChange={(e) => setGoalInputValue(e.target.value)}
                                                className="border rounded-xl px-3 py-1.5 text-sm w-28 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                                            />
                                            <Button size="sm" onClick={handleSaveGoal} className="h-8 rounded-xl font-bold bg-[#45a7d7] text-white">
                                                Save
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => setIsEditingGoal(false)} className="h-8 w-8 rounded-xl">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* IF TARGET IS SET */
                                <div className="flex flex-col gap-4">
                                    {isEditingGoal ? (
                                        /* Edit Target Inline Form */
                                        <div className="flex items-center justify-between gap-3 border-b pb-3">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number"
                                                    value={goalInputValue}
                                                    onChange={(e) => setGoalInputValue(e.target.value)}
                                                    className="border rounded-xl px-3 py-1.5 text-sm w-28 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                                                />
                                                <Button size="sm" onClick={handleSaveGoal} className="h-8 rounded-xl font-bold bg-[#45a7d7] text-white">
                                                    Save
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => setIsEditingGoal(false)} className="h-8 w-8 rounded-xl">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <button 
                                                onClick={handleRemoveGoal}
                                                className="text-xs text-destructive font-bold hover:underline"
                                            >
                                                Remove Target
                                            </button>
                                        </div>
                                    ) : null}

                                    <div className="flex justify-between items-end">
                                        <span className="text-3xl font-black">{totalConsumed} <span className="text-xs font-bold text-muted-foreground">kcal</span></span>
                                        <span className="text-xs text-muted-foreground font-semibold">Target: {dailyGoal} kcal</span>
                                    </div>
                                    
                                    {/* Linear Progress bar */}
                                    <div className="h-3.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-sky-400 to-[#45a7d7] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                    </div>

                                    <div className="flex justify-between items-center text-xs font-semibold">
                                        <span className={totalConsumed <= dailyGoal ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                                            {totalConsumed <= dailyGoal ? `${dailyGoal - totalConsumed} kcal remaining` : `${totalConsumed - dailyGoal} kcal over target`}
                                        </span>
                                        <span className="text-primary">{progressPercent}%</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
