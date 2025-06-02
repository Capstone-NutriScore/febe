import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ChefHat, Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FoodRecipeProps {
  foodName: string;
}

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
}

const FoodRecipe: React.FC<FoodRecipeProps> = ({ foodName }) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      
      // Resep default jika tidak ditemukan di database
      const defaultRecipe = {
        id: 'default',
        title: `${foodName} Sehat`,
        ingredients: [
          '2 porsi bahan utama',
          'Bumbu secukupnya',
          'Sayuran sesuai selera',
          'Minyak zaitun untuk menumis',
          'Garam himalaya secukupnya',
          'Lada hitam secukupnya'
        ],
        steps: [
          'Siapkan semua bahan dengan takaran yang sesuai.',
          'Gunakan minyak sehat seperti minyak zaitun untuk menumis.',
          'Tambahkan bumbu secukupnya untuk rasa.',
          'Masak dengan api sedang hingga matang.',
          'Tambahkan sayuran untuk meningkatkan nilai gizi.',
          'Sajikan selagi hangat.'
        ]
      };
      
      try {
        // Coba ambil semua resep terlebih dahulu untuk debugging
        const { data: allRecipes } = await supabase
          .from('food_recipes')
          .select('*');
          
        console.log('All recipes:', allRecipes);
        
        // Cari resep yang cocok dengan nama makanan
        let matchedRecipe = null;
        
        if (allRecipes && allRecipes.length > 0) {
          // Cari resep yang cocok (case insensitive)
          matchedRecipe = allRecipes.find(r => 
            r.title && r.title.toLowerCase().includes(foodName.toLowerCase())
          );
          
          if (matchedRecipe) {
            console.log('Found matching recipe:', matchedRecipe);
            
            // Konversi ingredients dan steps dari string ke array jika perlu
            let ingredientsArray = [];
            let stepsArray = [];
            
            if (typeof matchedRecipe.ingredients === 'string') {
              // Split berdasarkan nomor atau koma
              ingredientsArray = matchedRecipe.ingredients
                .split(/\d+\)|\d+\.|\s*,\s*/)
                .map(item => item.trim())
                .filter(item => item.length > 0);
            } else if (Array.isArray(matchedRecipe.ingredients)) {
              ingredientsArray = matchedRecipe.ingredients;
            }
            
            if (typeof matchedRecipe.steps === 'string') {
              // Split berdasarkan nomor atau koma
              stepsArray = matchedRecipe.steps
                .split(/\d+\)|\d+\.|\s*,\s*/)
                .map(item => item.trim())
                .filter(item => item.length > 0);
            } else if (Array.isArray(matchedRecipe.steps)) {
              stepsArray = matchedRecipe.steps;
            }
            
            setRecipe({
              id: matchedRecipe.id,
              title: matchedRecipe.title,
              ingredients: ingredientsArray,
              steps: stepsArray
            });
          } else {
            console.log('No matching recipe found, using default');
            setRecipe(defaultRecipe);
          }
        } else {
          console.log('No recipes in database, using default');
          setRecipe(defaultRecipe);
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setRecipe(defaultRecipe);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [foodName]);

  if (isLoading) {
    return (
      <Card className="shadow-lg border-2 border-dashed border-amber-200">
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          <span className="ml-2">Mencari resep...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-amber-200">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <ChefHat className="w-5 h-5 text-amber-600" />
          Resep {recipe?.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-amber-700 font-medium">
              Bahan-bahan
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {recipe?.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="steps">
            <AccordionTrigger className="text-amber-700 font-medium">
              Langkah-langkah
            </AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                {recipe?.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FoodRecipe;