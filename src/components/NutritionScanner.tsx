import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from './ImageUploader';
import { NutritionResults } from './NutritionResults';
import { CameraCapture } from './CameraCapture';
import { ProfileManager } from './ProfileManager';
import { FoodNutritionManager } from './FoodNutritionManager';
// Removed PortionCalculator import as it's no longer needed
import { loadModel, predictNutrition } from '@/lib/tfModel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Loader2, 
  Camera, 
  Sparkles, 
  Upload, 
  User, 
  Database,
  LogOut,
  Zap
} from 'lucide-react';

interface NutritionData {
  calories: number; // numeric
  protein: number; // float
  carbohydrates: number; // float
  fat: number; // float
  fibre: number; // float
  nat: number; // float
  foodName?: string;
  confidence?: number;
}

interface FoodDatabase {
  id: string;
  name: string;
  serving_size: number;
  calories: number; // numeric
  protein: number; // float
  carbohydrates: number; // float
  fat: number; // float
  fibre: number; // float
  nat: number; // float
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  activity_level: string;
  height: number;
  weight: number;
}

const NutritionScanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('scanner');
  const [matchedFood, setMatchedFood] = useState<FoodDatabase | null>(null);
  // Removed showPortionCalculator state as it's no longer needed
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [portionGrams, setPortionGrams] = useState<number | null>(null);
  const modelRef = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      initializeModel();
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const initializeModel = async () => {
    setIsLoading(true);
    try {
      console.log('Loading TensorFlow.js model...');
      const model = await loadModel();
      modelRef.current = model;
      setModelLoaded(true);
      toast.success('Model AI berhasil dimuat!');
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
      toast.error('Gagal memuat model. Menggunakan mode demo.');
      setModelLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const searchFoodInDatabase = async (foodName: string): Promise<FoodDatabase | null> => {
    try {
      const { data, error } = await supabase
        .from('food_nutrition')
        .select('*')
        .ilike('name', `%${foodName}%`)
        .limit(1)
        .single();

      if (error) {
        console.log('Food not found in database:', foodName);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error searching food:', error);
      return null;
    }
  };

  const handleImageSelect = (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    setNutritionData(null);
    setMatchedFood(null);
    setPortionGrams(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage || !modelLoaded) {
      toast.error('Silakan pilih gambar dan pastikan model sudah dimuat');
      return;
    }
    
    if (!portionGrams || portionGrams <= 0) {
      toast.error('Silakan masukkan berat porsi terlebih dahulu');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Analyzing image...');
      
      // Default nutrition values based on portion size (100g per portion)
      // These are fallback values that will be used if AI prediction fails
      const defaultNutrition: NutritionData = {
        calories: Math.round(250 * (portionGrams / 100)),
        protein: parseFloat((15 * (portionGrams / 100)).toFixed(1)),
        carbohydrates: parseFloat((40 * (portionGrams / 100)).toFixed(1)),
        fat: parseFloat((10 * (portionGrams / 100)).toFixed(1)),
        fibre: parseFloat((5 * (portionGrams / 100)).toFixed(1)),
        nat: parseFloat((300 * (portionGrams / 100)).toFixed(1)),
        foodName: 'Makanan',
        confidence: 0.7
      };
      
      let result: NutritionData = defaultNutrition;
      
      try {
        if (modelRef.current) {
          const aiResult = await predictNutrition(modelRef.current, selectedImage);
          
          // If AI prediction returns valid values, use them
          if (aiResult.calories > 0 || aiResult.protein > 0) {
            // Apply portion size calculation (100g per portion)
            const ratio = portionGrams / 100;
            
            result = {
              calories: Math.round(aiResult.calories * ratio),
              protein: parseFloat((aiResult.protein * ratio).toFixed(1)),
              carbohydrates: parseFloat((aiResult.carbohydrates * ratio).toFixed(1)),
              fat: parseFloat((aiResult.fat * ratio).toFixed(1)),
              fibre: parseFloat((aiResult.fibre * ratio).toFixed(1)),
              nat: parseFloat((aiResult.nat * ratio).toFixed(1)),
              foodName: aiResult.foodName,
              confidence: aiResult.confidence
            };
          }
        }
      } catch (aiError) {
        console.error('AI prediction error:', aiError);
        // Continue with default values
      }
      
      // Always set nutrition data, even if AI fails
      setNutritionData(result);
      
      // Try to find the food in database
      if (result.foodName) {
        const foundFood = await searchFoodInDatabase(result.foodName);
        if (foundFood) {
          // Calculate nutrition based on the selected portion (100g per portion)
          const ratio = portionGrams / 100;
          
          // Update nutritionData with the database values adjusted for portion
          const dbNutritionData: NutritionData = {
            calories: Math.round(foundFood.calories * ratio),
            protein: parseFloat((foundFood.protein * ratio).toFixed(1)),
            carbohydrates: parseFloat((foundFood.carbohydrates * ratio).toFixed(1)),
            fat: parseFloat((foundFood.fat * ratio).toFixed(1)),
            fibre: parseFloat((foundFood.fibre * ratio).toFixed(1)),
            nat: parseFloat((foundFood.nat * ratio).toFixed(1)),
            foodName: foundFood.name,
            confidence: 1.0
          };
          setNutritionData(dbNutritionData);
          
          toast.success(`Makanan ditemukan di database: ${foundFood.name}`);
        }
      }

      console.log('Analysis complete:', result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Gagal menganalisis gambar');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Removed handlePortionCalculation as it's no longer needed

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Berhasil logout');
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NutriScore
            </CardTitle>
            <p className="text-gray-600 mt-2">Analisis nutrisi makanan pintar dengan AI</p>
          </CardHeader>
          <CardContent className="pt-6">
            <Button 
              onClick={() => {
                window.location.href = '/auth';
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Masuk / Daftar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NutriScore
                </h1>
                <p className="text-sm text-gray-600">Analisis nutrisi makanan pintar dengan AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {userProfile?.name || 'Loading...'}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {modelLoaded ? (
                    <>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      online
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Memuat Model...
                    </>
                  )}
                </div>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="scanner" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Camera className="w-4 h-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg">
                      <Upload className="w-5 h-5 text-emerald-600" />
                    </div>
                    Upload atau Ambil Foto Makanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploader 
                    onImageSelect={handleImageSelect}
                    selectedImage={selectedImage}
                  />
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setShowCamera(true)}
                      variant="outline"
                      className="flex-1 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Buka Kamera
                    </Button>
                  </div>
                  
                  {selectedImage && (
                    <>
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <Label className="text-sm font-medium text-gray-700">Masukkan Berat Porsi:</Label>
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="flex-1 relative">
                              <Input
                                type="number"
                                placeholder="Masukkan berat dalam gram"
                                value={portionGrams || ''}
                                onChange={(e) => setPortionGrams(parseFloat(e.target.value) || 0)}
                                className="pr-12 border-emerald-200 focus:border-emerald-400"
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                gram
                              </div>
                            </div>
                          </div>
                          
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Pilihan Porsi Cepat:</Label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: '1/2 Porsi', grams: 100 },
                              { label: '1 Porsi', grams: 200 },
                              { label: '1.5 Porsi', grams: 300 },
                              { label: '2 Porsi', grams: 400 }
                            ].map((suggestion) => (
                              <Button
                                key={suggestion.label}
                                variant="outline"
                                size="sm"
                                onClick={() => setPortionGrams(suggestion.grams)}
                                className={`text-xs h-12 flex flex-col items-center justify-center ${
                                  portionGrams === suggestion.grams 
                                    ? 'bg-emerald-100 border-emerald-300' 
                                    : 'border-emerald-200 hover:bg-emerald-50'
                                }`}
                              >
                                <span className="font-medium">{suggestion.label}</span>
                                <span className="text-emerald-600">{suggestion.grams}g</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={analyzeImage}
                        disabled={isAnalyzing || !modelLoaded || !portionGrams || portionGrams <= 0}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Menganalisis Makanan...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-3" />
                            Analisis Nutrisi dengan AI
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Results Section */}
              <div className="space-y-6">
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                      </div>
                      Hasil Analisis Nutrisi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {nutritionData ? (
                      <NutritionResults data={nutritionData} userProfile={userProfile} />
                    ) : (
                      <div className="text-center py-16 text-gray-500">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                          <Camera className="w-10 h-10 text-emerald-400" />
                        </div>
                        <p className="text-lg font-medium mb-2">Belum ada analisis</p>
                        <p className="text-sm">Upload atau ambil foto makanan untuk melihat hasil analisis nutrisi</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Portion Calculator removed as requested */}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManager userId={user.id} />
          </TabsContent>

          <TabsContent value="database">
            <FoodNutritionManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Camera Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onImageCapture={handleImageSelect}
      />
    </div>
  );
};

export default NutritionScanner;