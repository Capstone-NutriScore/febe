
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Save, Edit } from 'lucide-react';

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

interface ProfileManagerProps {
  userId: string;
}

export const ProfileManager = ({ userId }: ProfileManagerProps) => {
  const [profile, setProfile] = useState<Profile>({
    user_id: userId,
    name: '',
    age: 25,
    gender: '',
    activity_level: '',
    height: 170,
    weight: 70
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        setIsEditing(true); // No profile exists, start editing
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Gagal memuat profil');
    }
  };

  const saveProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert([profile])
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setIsEditing(false);
      toast.success('Profil berhasil disimpan!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Gagal menyimpan profil');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBMR = () => {
    // Mifflin-St Jeor Equation
    const { weight, height, age, gender } = profile;
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity factor
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const factor = activityFactors[profile.activity_level as keyof typeof activityFactors] || 1.2;
    return Math.round(bmr * factor);
  };

  const calculateBMI = () => {
    const heightInM = profile.height / 100;
    return (profile.weight / (heightInM * heightInM)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Kurus', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Gemuk', color: 'text-yellow-600' };
    return { category: 'Obesitas', color: 'text-red-600' };
  };

  const bmi = parseFloat(calculateBMI());
  const bmiInfo = getBMICategory(bmi);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profil Kesehatan
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Umur</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) => setProfile({ ...profile, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Tinggi Badan (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="weight">Berat Badan (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="activity">Tingkat Aktivitas</Label>
              <Select
                value={profile.activity_level}
                onValueChange={(value) => setProfile({ ...profile, activity_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tingkat aktivitas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentari (tidak berolahraga)</SelectItem>
                  <SelectItem value="light">Ringan (olahraga 1-3x/minggu)</SelectItem>
                  <SelectItem value="moderate">Sedang (olahraga 3-5x/minggu)</SelectItem>
                  <SelectItem value="active">Aktif (olahraga 6-7x/minggu)</SelectItem>
                  <SelectItem value="very_active">Sangat Aktif (2x sehari)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveProfile} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Menyimpan...' : 'Simpan Profil'}
              </Button>
              {profile.id && (
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  disabled={isLoading}
                >
                  Batal
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nama:</span>
                <p className="font-medium">{profile.name || 'Belum diisi'}</p>
              </div>
              <div>
                <span className="text-gray-600">Umur:</span>
                <p className="font-medium">{profile.age} tahun</p>
              </div>
              <div>
                <span className="text-gray-600">Jenis Kelamin:</span>
                <p className="font-medium">{profile.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <span className="text-gray-600">Tinggi:</span>
                <p className="font-medium">{profile.height} cm</p>
              </div>
              <div>
                <span className="text-gray-600">Berat:</span>
                <p className="font-medium">{profile.weight} kg</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">BMI:</span>
                <span className={`font-bold ${bmiInfo.color}`}>
                  {calculateBMI()} ({bmiInfo.category})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Kebutuhan Kalori Harian:</span>
                <span className="font-bold text-blue-600">{calculateBMR()} kcal</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
