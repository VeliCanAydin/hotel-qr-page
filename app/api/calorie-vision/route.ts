import { NextRequest, NextResponse } from 'next/server';

/**
 * FastAPI /api/v1/analyze endpoint'inden dönen yapı.
 * Bu tip, backend'den gelen JSON'u tanımlar.
 */
interface MacroNutrients {
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number | null;
    sugar_g?: number | null;
    sodium_mg?: number | null;
    saturated_fat_g?: number | null;
}

interface ConfidenceInterval {
    min_calories: number;
    max_calories: number;
    overall_confidence: number;
    confidence_label: string;
}

interface DetectedFoodItem {
    food_name: string;
    food_name_en?: string | null;
    estimated_weight_g?: number | null;
    portion_description?: string | null;
    confidence: number;
    usda_fdc_id?: number | null;
    usda_verified: boolean;
    nutrition?: MacroNutrients | null;
}

interface NutritionAnalysisResult {
    detected_foods: DetectedFoodItem[];
    total_nutrition: MacroNutrients;
    confidence_interval: ConfidenceInterval;
    model_used: string;
    processing_time_ms: number;
    analysis_notes?: string | null;
    analyzed_at: string;
}

export async function POST(request: NextRequest) {
    try {
        const { image_base64, image_mime_type, language } = await request.json();

        if (!image_base64) {
            return NextResponse.json(
                { error: 'image_base64 alanı zorunludur.' },
                { status: 400 }
            );
        }

        const calorieApiUrl = process.env.CALORIE_API_URL || 'http://localhost:8000/api/v1/analyze';

        // base64 → Buffer → Blob dönüşümü (multipart/form-data için)
        const imageBuffer = Buffer.from(image_base64, 'base64');
        const mimeType = image_mime_type || 'image/jpeg';
        const imageBlob = new Blob([imageBuffer], { type: mimeType });

        const formData = new FormData();
        formData.append('image', imageBlob, 'upload.jpg');
        formData.append('language', language || 'tr');

        // FastAPI'nin gerçek analiz endpoint'i
        const response = await fetch(calorieApiUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`FastAPI error ${response.status}: ${errorBody}`);
        }

        const backendData = await response.json();

        // 1. Map each food item to the expected DetectedFoodItem structure
        const detectedFoods: DetectedFoodItem[] = (backendData.detected_foods || []).map((food: any) => {
            return {
                food_name: food.name || 'Bilinmeyen Yemek',
                food_name_en: food.name_en || null,
                estimated_weight_g: food.estimated_weight_g || null,
                portion_description: food.portion_description || null,
                confidence: food.confidence || 0.8,
                usda_fdc_id: null,
                usda_verified: false,
                nutrition: {
                    calories_kcal: food.calories_kcal || 0.0,
                    protein_g: food.protein_g || 0.0,
                    carbs_g: food.carbs_g || 0.0,
                    fat_g: food.fat_g || 0.0,
                    fiber_g: null,
                    sugar_g: null,
                    sodium_mg: null,
                    saturated_fat_g: null
                }
            };
        });

        // 2. Sum up totals across all items
        const totalCalories = detectedFoods.reduce((sum, f) => sum + (f.nutrition?.calories_kcal || 0), 0);
        const totalProtein = detectedFoods.reduce((sum, f) => sum + (f.nutrition?.protein_g || 0), 0);
        const totalCarbs = detectedFoods.reduce((sum, f) => sum + (f.nutrition?.carbs_g || 0), 0);
        const totalFat = detectedFoods.reduce((sum, f) => sum + (f.nutrition?.fat_g || 0), 0);

        const totalNutrition: MacroNutrients = {
            calories_kcal: Math.round(totalCalories),
            protein_g: Math.round(totalProtein),
            carbs_g: Math.round(totalCarbs),
            fat_g: Math.round(totalFat),
            fiber_g: null,
            sugar_g: null,
            sodium_mg: null,
            saturated_fat_g: null
        };

        // 3. Compute confidence interval (mocked using the backend fields)
        const avgConfidence = detectedFoods.length > 0
            ? detectedFoods.reduce((sum, f) => sum + f.confidence, 0) / detectedFoods.length
            : 0.8;

        const qualityModifier = { excellent: 1.0, good: 0.95, fair: 0.85, poor: 0.70 };
        const adjustedConfidence = avgConfidence * (qualityModifier[backendData.image_quality as keyof typeof qualityModifier] || 0.85);

        let confidenceLabel = 'Orta';
        let uncertainty = 0.20;
        if (adjustedConfidence >= 0.85) {
            confidenceLabel = 'Yüksek';
            uncertainty = 0.10;
        } else if (adjustedConfidence < 0.60) {
            confidenceLabel = 'Düşük';
            uncertainty = 0.35;
        }

        const margin = totalCalories * uncertainty;

        const confidenceInterval: ConfidenceInterval = {
            min_calories: Math.max(0, Math.round(totalCalories - margin)),
            max_calories: Math.round(totalCalories + margin),
            overall_confidence: adjustedConfidence,
            confidence_label: confidenceLabel
        };

        // 4. Assemble final NutritionAnalysisResult
        const mappedResult: NutritionAnalysisResult = {
            detected_foods: detectedFoods,
            total_nutrition: totalNutrition,
            confidence_interval: confidenceInterval,
            model_used: 'gpt-4o-mini', // default
            processing_time_ms: 1000, // mock latency
            analysis_notes: backendData.analysis_notes || null,
            analyzed_at: new Date().toISOString()
        };

        return NextResponse.json(mappedResult);

    } catch (error) {
        console.error('AI Calorie Vision API Error:', error);

        return NextResponse.json(
            {
                error: 'AI Vision servisiyle bağlantı kurulamadı. Lütfen tekrar deneyin.',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
