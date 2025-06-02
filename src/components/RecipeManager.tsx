import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChefHat, Plus, Trash, Save, Edit, RefreshCw } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  steps: string[];
}

const RecipeManager = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecipeId, setCurrentRecipeId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_recipes')
        .select('*')
        .order('name');

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Gagal memuat resep');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setIngredients(['']);
    setSteps(['']);
    setIsEditing(false);
    setCurrentRecipeId(null);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleEdit = (recipe: Recipe) => {
    setName(recipe.name);
    setIngredients(recipe.ingredients || ['']);
    setSteps(recipe.steps || ['']);
    setIsEditing(true);
    setCurrentRecipeId(recipe.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus resep ini?')) return;
    
    try {
      const { error } = await supabase
        .from('food_recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Resep berhasil dihapus');
      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Gagal menghapus resep');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!name.trim()) {
      toast.error('Nama resep harus diisi');
      return;
    }
    
    const filteredIngredients = ingredients.filter(i => i.trim() !== '');
    if (filteredIngredients.length === 0) {
      toast.error('Minimal satu bahan harus diisi');
      return;
    }
    
    const filteredSteps = steps.filter(s => s.trim() !== '');
    if (filteredSteps.length === 0) {
      toast.error('Minimal satu langkah harus diisi');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isEditing && currentRecipeId) {
        // Update existing recipe
        const { error } = await supabase
          .from('food_recipes')
          .update({
            name: name.trim(),
            ingredients: filteredIngredients,
            steps: filteredSteps
          })
          .eq('id', currentRecipeId);
          
        if (error) throw error;
        toast.success('Resep berhasil diperbarui!');
      } else {
        // Create new recipe
        const { error } = await supabase
          .from('food_recipes')
          .insert([{
            name: name.trim(),
            ingredients: filteredIngredients,
            steps: filteredSteps
          }]);
          
        if (error) throw error;
        toast.success('Resep berhasil disimpan!');
      }
      
      // Reset form and refresh recipes
      resetForm();
      fetchRecipes();
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      toast.error(error.message || 'Gagal menyimpan resep');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-600" />
            {isEditing ? 'Edit Resep' : 'Tambah Resep Makanan Sehat'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Nama Makanan</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Nasi Goreng Sehat"
                required
              />
            </div>
            
            <div className="space-y-4">
              <Label>Bahan-bahan</Label>
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`Bahan ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addIngredient}
                className="w-full border-dashed border-amber-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Bahan
              </Button>
            </div>
            
            <div className="space-y-4">
              <Label>Langkah-langkah</Label>
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`Langkah ${index + 1}`}
                    className="min-h-[80px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeStep(index)}
                    disabled={steps.length === 1}
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addStep}
                className="w-full border-dashed border-amber-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Langkah
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? 'Memperbarui...' : 'Menyimpan...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Perbarui Resep' : 'Simpan Resep'}
                  </>
                )}
              </Button>
              
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Batal
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-600" />
              Daftar Resep
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchRecipes}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {recipes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Belum ada resep. Tambahkan resep pertama Anda!
            </p>
          ) : (
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <Card key={recipe.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-amber-800">{recipe.name}</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(recipe)}
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(recipe.id)}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {recipe.ingredients?.length || 0} bahan, {recipe.steps?.length || 0} langkah
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeManager;