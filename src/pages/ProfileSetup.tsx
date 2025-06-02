import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Save } from 'lucide-react';

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

const ProfileSetup = () => {
  const [profile, setProfile] = useState<Profile>({
    user_id: '',
    name: '',
    age: 25,
    gender: '',
    activity_level: '',
    height: 170,
    weight: 70
  });
  
  // Pastikan nilai tidak pernah null untuk input
  const safeValue = (value: any) => value === null ? '' : value;
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Cek apakah ada userId dari registrasi
    const tempUserId = localStorage.getItem('tempUserId');
    const tempUserName = localStorage.getItem('tempUserName');
    
    if (tempUserId && tempUserName) {
      setUserId(tempUserId);
      
      // Set nama dari localStorage
      setProfile(prev => ({
        ...prev,
        user_id: tempUserId,
        name: tempUserName
      }));
    } else {
      // Jika tidak ada, redirect ke halaman login
      window.location.href = '/auth';
    }
  }, []);

  const loadProfile = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Jika tidak ada profil, buat profil kosong dengan userId
        setProfile({
          user_id: id,
          name: '',
          age: 25,
          gender: '',
          activity_level: '',
          height: 170,
          weight: 70
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Gagal memuat profil');
    }
  };

  const saveProfile = async () => {
    if (!profile.gender || !profile.activity_level) {
      toast.error('Silakan lengkapi semua data profil');
      return;
    }

    setIsLoading(true);
    try {
      // Ambil data registrasi dari localStorage
      const email = localStorage.getItem('tempUserEmail');
      const password = localStorage.getItem('tempUserPassword');
      const name = localStorage.getItem('tempUserName');
      
      if (!email || !password || !name) {
        throw new Error('Data registrasi tidak lengkap');
      }
      
      // Daftarkan user ke Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Buat objek profil dengan user_id yang benar
        const profileData = {
          user_id: authData.user.id,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          activity_level: profile.activity_level,
          height: profile.height,
          weight: profile.weight
        };
        
        // Simpan profil ke database
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([profileData]);
          
        if (profileError) throw profileError;
        
        toast.success('Profil berhasil disimpan!');
        
        // Hapus data sementara dari localStorage
        localStorage.removeItem('tempUserId');
        localStorage.removeItem('tempUserEmail');
        localStorage.removeItem('tempUserPassword');
        localStorage.removeItem('tempUserName');
        localStorage.removeItem('isNewRegistration');
        
        // Redirect ke halaman login
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Gagal menyimpan profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Lengkapi Profil Anda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">


            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Umur</Label>
                <Input
                  id="age"
                  type="number"
                  value={safeValue(profile.age)}
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
                  value={safeValue(profile.height)}
                  onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="weight">Berat Badan (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={safeValue(profile.weight)}
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

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={saveProfile} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Menyimpan...' : 'Simpan Profil & Lanjut ke Login'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;