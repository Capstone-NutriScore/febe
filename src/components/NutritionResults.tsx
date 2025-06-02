

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Beef, 
  Wheat, 
  Droplets, 
  Leaf, 
  CheckCircle,
  TrendingUp,
  Salad,
  Award,
  ChefHat
} from 'lucide-react';
import PersonalizedNutriScore from './PersonalizedNutriScore';
import FoodRecipe from './FoodRecipe';
import { calculateBMR, calculateTDEE } from '@/lib/nutriScore';

interface NutritionData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fibre: number;
  nat: number;
  foodName?: string;
  confidence?: number;
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

interface NutritionResultsProps {
  data: NutritionData;
  userProfile?: Profile;
}

export const NutritionResults = ({ data, userProfile }: NutritionResultsProps) => {
  // Hitung TDEE jika userProfile tersedia
  const tdee = userProfile ? calculateTDEE(
    calculateBMR(
      userProfile.weight,
      userProfile.height,
      userProfile.age,
      userProfile.gender
    ),
    userProfile.activity_level
  ) : 0;
  const nutritionItems = [
    {
      icon: Zap,
      label: 'Kalori',
      value: data.calories,
      unit: 'kcal',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      maxValue: 500,
      borderColor: 'border-orange-200'
    },
    {
      icon: Beef,
      label: 'Protein',
      value: data.protein,
      unit: 'g',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      maxValue: 30,
      borderColor: 'border-red-200'
    },
    {
      icon: Wheat,
      label: 'Karbohidrat',
      value: data.carbohydrates,
      unit: 'g',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      maxValue: 60,
      borderColor: 'border-yellow-200'
    },
    {
      icon: Droplets,
      label: 'Lemak',
      value: data.fat,
      unit: 'g',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      maxValue: 20,
      borderColor: 'border-blue-200'
    },
    {
      icon: Leaf,
      label: 'Serat',
      value: data.fibre,
      unit: 'g',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      maxValue: 10,
      borderColor: 'border-green-200'
    },
    {
      icon: Salad,
      label: 'Natrium',
      value: data.nat,
      unit: 'mg',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      maxValue: 1000,
      borderColor: 'border-purple-200'
    }
  ];

  // Natrium is already included in the main array

  return (
    <div className="space-y-6">
      {/* Food Name and Confidence */}
      {data.foodName && (
        <div className="text-center space-y-3 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{data.foodName}</h3>
          {data.confidence && (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
             
            </div>
          )}
        </div>
      )}

      {/* Nutrition Grid */}
      <div className="grid grid-cols-2 gap-4">
        {nutritionItems.map((item) => {
          const Icon = item.icon;
          const percentage = Math.min((item.value / item.maxValue) * 100, 100);
          
          return (
            <Card key={item.label} className={`border-2 ${item.borderColor} shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${item.bgColor} border ${item.borderColor}`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{item.label}</p>
                    <p className="text-xl font-bold text-gray-800">
                      {item.value} <span className="text-sm font-normal text-gray-600">{item.unit}</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>{item.maxValue}{item.unit}</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-3 bg-gray-100"
                  />
                  <div className="text-right text-xs text-gray-500">
                    {Math.round(percentage)}% dari batas harian
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Summary */}
      <Card className="border-2 border-dashed border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-800">Ringkasan Nutrisi</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Kalori:</span>
                <span className="font-semibold text-orange-600">{data.calories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Protein:</span>
                <span className="font-semibold text-red-600">{data.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Karbohidrat:</span>
                <span className="font-semibold text-yellow-600">{data.carbohydrates}g</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Lemak:</span>
                <span className="font-semibold text-blue-600">{data.fat}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Serat:</span>
                <span className="font-semibold text-green-600">{data.fibre}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Natrium:</span>
                <span className="font-semibold text-purple-600">{data.nat}mg</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Personalized Nutri-Score */}
      {userProfile && tdee > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-800">Nutri-Score Personalisasi</h4>
          </div>
          <PersonalizedNutriScore 
            nutritionData={data} 
            userProfile={userProfile} 
            tdee={tdee} 
          />
        </div>
      )}
      
      {/* Food Recipe */}
      {data.foodName && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-800">Resep Sehat</h4>
          </div>
          <FoodRecipe foodName={data.foodName} />
        </div>
      )}
    </div>
  );
};
