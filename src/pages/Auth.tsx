import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Handle SignIn (Login)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Berhasil login!');
      window.location.href = '/intro';  // Redirect to intro page after login
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Gagal login');
      setIsLoading(false);
    }
  };

  // Handle SignUp (Registration)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    if (!name.trim()) {
      toast.error('Nama harus diisi');
      return;
    }

    setIsLoading(true);

    try {
      const tempId = 'temp_' + Date.now();
      
      localStorage.setItem('tempUserId', tempId);
      localStorage.setItem('tempUserEmail', email);
      localStorage.setItem('tempUserPassword', password);
      localStorage.setItem('tempUserName', name.trim());
      localStorage.setItem('isNewRegistration', 'true');
      
      toast.success('Silakan lengkapi profil Anda.');
      
      setTimeout(() => {
        window.location.href = '/profile-setup';  // Redirect to profile setup after sign-up
      }, 1000);
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Gagal membuat akun');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-green-100 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <img src="/logo_nutriscore.jpeg" alt="NutriScore Logo" className="w-24 h-24 rounded-full" />
          </div>
          <CardTitle className="text-3xl font-bold text-transparent">
            {/* Removed NutriScore Text */}
          </CardTitle>
          <p className="text-green-700">
            Analisis nutrisi makanan dengan AI
          </p>
        </CardHeader>

        <CardContent>
          <Tabs value={isSignUp ? 'signup' : 'signin'} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-cream-100">
              <TabsTrigger
                value="signin"
                onClick={() => setIsSignUp(false)}
                className="data-[state=active]:bg-green-500 data-[state=active]:text-cream-50"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                onClick={() => setIsSignUp(true)}
                className="data-[state=active]:bg-green-500 data-[state=active]:text-cream-50"
              >
                Daftar
              </TabsTrigger>
            </TabsList>

            {/* Sign In */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-green-800">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-cream-50 border-green-100 focus:border-green-300 focus:ring-green-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-green-800">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-cream-50 border-green-100 focus:border-green-300 focus:ring-green-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-green-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-cream-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-green-800">Nama Lengkap</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Nama lengkap Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-cream-50 border-green-100 focus:border-green-300 focus:ring-green-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-green-800">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-cream-50 border-green-100 focus:border-green-300 focus:ring-green-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-green-800">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (minimal 6 karakter)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-cream-50 border-green-100 focus:border-green-300 focus:ring-green-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-green-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-green-800">Konfirmasi Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-cream-50 border-green-100 focus:border-green-300 focus:ring-green-200"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-cream-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Daftar'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
