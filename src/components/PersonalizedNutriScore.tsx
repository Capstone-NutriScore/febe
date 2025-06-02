import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateAdjustedNutriScore, getNutriScoreColor } from '@/lib/nutriScore';
import { Badge } from '@/components/ui/badge';

interface NutritionData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fibre: number;
  nat: number;
  foodName?: string;
}

interface Profile {
  id?: string;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  activity_level: string;
  height: number;
  weight: number;
}

interface PersonalizedNutriScoreProps {
  nutritionData: NutritionData;
  userProfile: Profile;
  tdee: number;
}

const PersonalizedNutriScore: React.FC<PersonalizedNutriScoreProps> = ({ 
  nutritionData, 
  userProfile, 
  tdee 
}) => {
  // Hitung Nutri-Score yang disesuaikan
  const nutriScore = calculateAdjustedNutriScore(
    nutritionData.calories,
    nutritionData.protein,
    nutritionData.carbohydrates,
    nutritionData.fat,
    nutritionData.fibre,
    nutritionData.nat,
    tdee
  );

  // Dapatkan warna berdasarkan skor
  const scoreColor = getNutriScoreColor(nutriScore.score);

  return (
    <Card className="shadow-lg border-2 border-emerald-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Nutri-Score Personalisasi</span>
          <Badge className={`${scoreColor} text-white text-xl px-3 py-1`}>
            {nutriScore.score}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Skor Nutrisi: {nutriScore.value}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${scoreColor}`} 
                style={{ width: `${Math.min(Math.max(nutriScore.value * 5, 0), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Kebutuhan Kalori Harian:</p>
              <p className="font-bold text-emerald-600">{tdee} kcal</p>
            </div>
            <div>
              <p className="text-gray-600">Kalori Makanan:</p>
              <p className="font-bold text-orange-600">{nutritionData.calories} kcal</p>
              <p className="text-xs text-gray-500">
                ({Math.round((nutritionData.calories / tdee) * 100)}% dari kebutuhan harian)
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">Rekomendasi:</p>
            {nutriScore.score === 'A' || nutriScore.score === 'B' ? (
              <p className="text-sm text-green-600">
                Makanan ini merupakan pilihan yang baik untuk diet Anda.
              </p>
            ) : nutriScore.score === 'C' ? (
              <p className="text-sm text-yellow-600">
                Makanan ini cukup seimbang, tapi perhatikan porsinya.
              </p>
            ) : (
              <p className="text-sm text-red-600">
                Batasi konsumsi makanan ini karena tidak ideal untuk kebutuhan nutrisi Anda.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedNutriScore;