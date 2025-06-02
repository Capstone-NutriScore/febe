
import  { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Search, Database, Edit, Trash2, Save, X } from 'lucide-react';

interface FoodNutrition {
  id?: string;
  name: string;
  serving_size: number;
  calories: number; // numeric
  protein: number; // float
  carbohydrates: number; // float
  fat: number; // float
  fibre: number; // float
  nat: number; // float
  created_at?: string;
}

export const FoodNutritionManager = () => {
  const [foods, setFoods] = useState<FoodNutrition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodNutrition | null>(null);
  const [newFood, setNewFood] = useState<FoodNutrition>({
    name: '',
    serving_size: 100,
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fibre: 0,
    nat: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_nutrition')
        .select('*')
        .order('name');

      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      console.error('Error loading foods:', error);
      toast.error('Gagal memuat data makanan');
    } finally {
      setIsLoading(false);
    }
  };

  const saveFood = async (food: FoodNutrition) => {
    try {
      if (food.id) {
        // Update existing
        const { error } = await supabase
          .from('food_nutrition')
          .update(food)
          .eq('id', food.id);
        
        if (error) throw error;
        toast.success('Data makanan berhasil diperbarui!');
      } else {
        // Create new
        const { error } = await supabase
          .from('food_nutrition')
          .insert([food]);
        
        if (error) throw error;
        toast.success('Data makanan berhasil ditambahkan!');
      }
      
      loadFoods();
      setEditingFood(null);
      setShowAddForm(false);
      setNewFood({
        name: '',
        serving_size: 100,
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fibre: 0,
        nat: 0
      });
    } catch (error) {
      console.error('Error saving food:', error);
      toast.error('Gagal menyimpan data makanan');
    }
  };

  const deleteFood = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data makanan ini?')) return;
    
    try {
      const { error } = await supabase
        .from('food_nutrition')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Data makanan berhasil dihapus!');
      loadFoods();
    } catch (error) {
      console.error('Error deleting food:', error);
      toast.error('Gagal menghapus data makanan');
    }
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const FoodForm = ({ food, onChange, onSave, onCancel }: {
    food: FoodNutrition;
    onChange: (food: FoodNutrition) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nama Makanan</Label>
          <Input
            id="name"
            value={food.name}
            onChange={(e) => onChange({ ...food, name: e.target.value })}
            placeholder="Contoh: Nasi Putih"
          />
        </div>
        <div>
          <Label htmlFor="serving_size">Porsi (gram)</Label>
          <Input
            id="serving_size"
            type="number"
            value={food.serving_size}
            onChange={(e) => onChange({ ...food, serving_size: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="calories">Kalori</Label>
          <Input
            id="calories"
            type="number"
            value={food.calories}
            onChange={(e) => onChange({ ...food, calories: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="protein">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            step="0.1"
            value={food.protein}
            onChange={(e) => onChange({ ...food, protein: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="carbohydrates">Karbohidrat (g)</Label>
          <Input
            id="carbohydrates"
            type="number"
            step="0.1"
            value={food.carbohydrates}
            onChange={(e) => onChange({ ...food, carbohydrates: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="fat">Lemak (g)</Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            value={food.fat}
            onChange={(e) => onChange({ ...food, fat: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="fibre">Serat (g)</Label>
          <Input
            id="fibre"
            type="number"
            step="0.1"
            value={food.fibre}
            onChange={(e) => onChange({ ...food, fibre: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="nat">Natrium (mg)</Label>
          <Input
            id="nat"
            type="number"
            step="0.1"
            value={food.nat}
            onChange={(e) => onChange({ ...food, nat: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave}>
          <Save className="w-4 h-4 mr-2" />
          Simpan
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="w-4 h-4 mr-2" />
          Batal
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Nutrisi Makanan
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Makanan
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cari makanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Add Form */}
        {showAddForm && (
          <FoodForm
            food={newFood}
            onChange={setNewFood}
            onSave={() => saveFood(newFood)}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Foods List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Tidak ada makanan yang ditemukan' : 'Belum ada data makanan'}
            </div>
          ) : (
            filteredFoods.map((food) => (
              <div key={food.id} className="border rounded-lg p-4">
                {editingFood?.id === food.id ? (
                  <FoodForm
                    food={editingFood}
                    onChange={setEditingFood}
                    onSave={() => saveFood(editingFood)}
                    onCancel={() => setEditingFood(null)}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{food.name}</h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingFood(food)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteFood(food.id!)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      Per {food.serving_size}g porsi
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{food.calories} kcal</Badge>
                      <Badge variant="outline">Protein: {food.protein}g</Badge>
                      <Badge variant="outline">Karbo: {food.carbohydrates}g</Badge>
                      <Badge variant="outline">Lemak: {food.fat}g</Badge>
                      <Badge variant="outline">Serat: {food.fibre}g</Badge>
                      <Badge variant="outline">Natrium: {food.nat}mg</Badge>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
