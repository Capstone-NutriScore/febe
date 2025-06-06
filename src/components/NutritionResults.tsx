import React from 'react';
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
  ChefHat,
  Utensils
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
      color: 'text-orange-600',
      bgColor: 'bg-cream-100',
      maxValue: 500,
      borderColor: 'border-orange-200'
    },
    {
      icon: Beef,
      label: 'Protein',
      value: data.protein,
      unit: 'g',
      color: 'text-red-600',
      bgColor: 'bg-cream-100',
      maxValue: 30,
      borderColor: 'border-red-200'
    },
    {
      icon: Wheat,
      label: 'Karbohidrat',
      value: data.carbohydrates,
      unit: 'g',
      color: 'text-yellow-600',
      bgColor: 'bg-cream-100',
      maxValue: 60,
      borderColor: 'border-yellow-200'
    },
    {
      icon: Droplets,
      label: 'Lemak',
      value: data.fat,
      unit: 'g',
      color: 'text-blue-600',
      bgColor: 'bg-cream-100',
      maxValue: 20,
      borderColor: 'border-blue-200'
    },
    {
      icon: Leaf,
      label: 'Serat',
      value: data.fibre,
      unit: 'g',
      color: 'text-green-600',
      bgColor: 'bg-cream-100',
      maxValue: 10,
      borderColor: 'border-green-200'
    },
    {
      icon: Salad,
      label: 'Natrium',
      value: data.nat,
      unit: 'mg',
      color: 'text-purple-600',
      bgColor: 'bg-cream-100',
      maxValue: 1000,
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Food Name and Confidence */}
      {data.foodName && (
        <div className="text-center space-y-3 p-6 bg-gradient-to-r from-cream-100 to-green-50 rounded-2xl border border-green-200 shadow-md">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-transform duration-300 hover:rotate-12">
            <Utensils className="w-8 h-8 text-cream-50" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-green-900">{data.foodName}</h3>
          {data.confidence && (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              
            </div>
          )}
        </div>
      )}

      {/* Nutrition Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nutritionItems.map((item) => (
          <Card key={item.label} className={`border-2 ${item.borderColor} bg-cream-50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
            <CardContent className="p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${item.bgColor} border ${item.borderColor}`}>
                  <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-green-800">{item.label}</p>
                  <p className="text-sm sm:text-xl font-bold text-green-900">
                    {item.value.toFixed(1)} <span className="text-xs sm:text-sm font-normal text-green-700">{item.unit}</span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-green-700">
                  <span>0</span>
                  <span>{item.maxValue}{item.unit}</span>
                </div>
                <Progress 
                  value={Math.min((item.value / item.maxValue) * 100, 100)} 
                  className="h-3 bg-cream-100" 
                />
                <div className="text-right text-xs text-green-700">
                  {Math.round((item.value / item.maxValue) * 100)}% dari batas harian
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Summary */}
      <Card className="border-2 border-dashed border-green-300 bg-gradient-to-r from-cream-50 to-green-50 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md">
              <TrendingUp className="w-6 h-6 text-cream-50" />
            </div>
            <h4 className="text-lg font-bold text-green-900">Ringkasan Nutrisi</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-cream-100 hover:bg-cream-200 transition-colors duration-200">
                <span className="text-green-800">Total Kalori:</span>
                <span className="font-semibold text-orange-700 bg-cream-200 px-3 py-1 rounded-full">
                  {data.calories.toFixed(1)} kcal
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-cream-100 hover:bg-cream-200 transition-colors duration-200">
                <span className="text-green-800">Protein:</span>
                <span className="font-semibold text-red-700 bg-cream-200 px-3 py-1 rounded-full">
                  {data.protein.toFixed(1)}g
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-cream-100 hover:bg-cream-200 transition-colors duration-200">
                <span className="text-green-800">Karbohidrat:</span>
                <span className="font-semibold text-yellow-700 bg-cream-200 px-3 py-1 rounded-full">
                  {data.carbohydrates.toFixed(1)}g
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-cream-100 hover:bg-cream-200 transition-colors duration-200">
                <span className="text-green-800">Lemak:</span>
                <span className="font-semibold text-blue-700 bg-cream-200 px-3 py-1 rounded-full">
                  {data.fat.toFixed(1)}g
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-cream-100 hover:bg-cream-200 transition-colors duration-200">
                <span className="text-green-800">Serat:</span>
                <span className="font-semibold text-green-700 bg-cream-200 px-3 py-1 rounded-full">
                  {data.fibre.toFixed(1)}g
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-cream-100 hover:bg-cream-200 transition-colors duration-200">
                <span className="text-green-800">Natrium:</span>
                <span className="font-semibold text-purple-700 bg-cream-200 px-3 py-1 rounded-full">
                  {data.nat.toFixed(1)}mg
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Nutri-Score */}
      {userProfile && tdee > 0 && (
        <div className="mt-8 bg-cream-50 p-6 rounded-xl border-2 border-green-100 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl shadow-md">
              <Award className="w-6 h-6 text-cream-50" />
            </div>
            <h4 className="text-lg font-bold text-green-900">Nutri-Score Personalisasi</h4>
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
        <div className="mt-8 bg-cream-50 p-6 rounded-xl border-2 border-green-100 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-green-500 rounded-xl shadow-md">
              <ChefHat className="w-6 h-6 text-cream-50" />
            </div>
            <h4 className="text-lg font-bold text-green-900">Resep Sehat</h4>
          </div>
          <FoodRecipe foodName={data.foodName} />
        </div>
      )}
    </div>
  );
};
