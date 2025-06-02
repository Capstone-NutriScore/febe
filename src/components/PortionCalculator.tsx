
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, Info, Scale } from 'lucide-react';

interface FoodData {
  id: string;
  name: string;
  serving_size: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fibre: number;
  nat: number;
}

interface PortionCalculatorProps {
  foodData: FoodData;
  onCalculate: (grams: number) => void;
}

export const PortionCalculator: React.FC<PortionCalculatorProps> = ({
  foodData,
  onCalculate
}) => {
  const [inputGrams, setInputGrams] = useState<string>('');

  const handleCalculate = () => {
    const grams = parseFloat(inputGrams);
    if (isNaN(grams) || grams <= 0) {
      alert('Masukkan berat yang valid!');
      return;
    }
    onCalculate(grams);
  };

  const getPortionSuggestions = () => {
    const suggestions = [
      { label: '1/2 Porsi', grams: Math.round(foodData.serving_size * 0.5) },
      { label: '1 Porsi Standar', grams: foodData.serving_size },
      { label: '1.5 Porsi', grams: Math.round(foodData.serving_size * 1.5) },
      { label: '2 Porsi', grams: foodData.serving_size * 2 }
    ];
    return suggestions;
  };

  return (
    <div className="space-y-6">
      {/* Food Info */}
      <div className="bg-white rounded-xl p-4 border border-emerald-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Info className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{foodData.name}</h3>
            <p className="text-sm text-gray-600">Data dari database makanan</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-700">{foodData.serving_size}g</div>
            <div className="text-xs text-emerald-600">Porsi Standar</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-700">{foodData.calories} kcal</div>
            <div className="text-xs text-orange-600">Per Porsi Standar</div>
          </div>
        </div>
      </div>

      {/* Portion Suggestions */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Pilihan Porsi Cepat:</Label>
        <div className="grid grid-cols-2 gap-2">
          {getPortionSuggestions().map((suggestion) => (
            <Button
              key={suggestion.label}
              variant="outline"
              size="sm"
              onClick={() => {
                setInputGrams(suggestion.grams.toString());
                onCalculate(suggestion.grams);
              }}
              className="text-xs h-12 flex flex-col items-center justify-center border-emerald-200 hover:bg-emerald-50"
            >
              <span className="font-medium">{suggestion.label}</span>
              <span className="text-emerald-600">{suggestion.grams}g</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div className="space-y-3">
        <Label htmlFor="custom-grams" className="text-sm font-medium text-gray-700">
          Atau masukkan berat custom:
        </Label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              id="custom-grams"
              type="number"
              placeholder="Masukkan berat dalam gram"
              value={inputGrams}
              onChange={(e) => setInputGrams(e.target.value)}
              className="pr-12 border-emerald-200 focus:border-emerald-400"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              gram
            </div>
          </div>
          <Button 
            onClick={handleCalculate}
            disabled={!inputGrams}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Hitung
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Scale className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 text-sm">Tips Menimbang Makanan:</h4>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>• Gunakan timbangan digital untuk akurasi tinggi</li>
              <li>• Timbang makanan setelah dimasak</li>
              <li>• 1 porsi {foodData.name} ≈ {foodData.serving_size}g</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
