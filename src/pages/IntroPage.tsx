import React, { useState, useEffect } from 'react';
import { Utensils, Heart, Zap, Camera, Star, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Feature {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
  color: string;
}

const IntroPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [currentFeature, setCurrentFeature] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features: Feature[] = [
    { icon: Camera, text: "Scan makanan dengan AI", color: "text-blue-500" },
    { icon: TrendingUp, text: "Analisis nutrisi detail", color: "text-green-500" },
    { icon: Heart, text: "Hidup lebih sehat", color: "text-red-500" }
  ];

  const handleGetStarted = (): void => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-16 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-bounce"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className={`w-full max-w-lg transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          
          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-center">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                
                {/* Logo with Animation */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-white rounded-full mx-auto shadow-lg transform hover:scale-110 transition-transform duration-300 overflow-hidden">
                    <img
                      src="/logo_nutriscore.jpeg"
                      alt="NutriScore Logo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  Selamat Datang di
                </h1>
                <h2 className="text-4xl font-extrabold text-white mb-4 bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                  NutriScore
                </h2>
                
                {/* Animated Feature Display */}
                <div className="h-12 flex items-center justify-center">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={index}
                        className={`flex items-center space-x-2 transition-all duration-500 ${
                          currentFeature === index 
                            ? 'opacity-100 scale-100' 
                            : 'opacity-0 scale-95 absolute'
                        }`}
                      >
                        <Icon className={`w-5 h-5 text-white`} />
                        <span className="text-white font-medium">{feature.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="text-center mb-8">
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Analisis makanan Anda dengan <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">AI cerdas</span> dan lacak nutrisi untuk gaya hidup yang lebih sehat!
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow duration-300">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 mb-1">Scan & Analisis</h3>
                      <p className="text-sm text-gray-600">Foto makanan Anda dan dapatkan analisis nutrisi instant</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow duration-300">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 mb-1">Tracking Nutrisi</h3>
                      <p className="text-sm text-gray-600">Kalori, protein, karbohidrat, lemak & vitamin lengkap</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 hover:shadow-md transition-shadow duration-300">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 mb-1">Hidup Sehat</h3>
                      <p className="text-sm text-gray-600">Rekomendasi personal untuk gaya hidup lebih baik</p>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-2">AI</div>
                    <div className="text-sm font-medium text-gray-700">Powered</div>
                    <div className="text-xs text-gray-500 mt-1">Teknologi Cerdas</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2">24/7</div>
                    <div className="text-sm font-medium text-gray-700">Siap Pakai</div>
                    <div className="text-xs text-gray-500 mt-1">Kapan Saja</div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="space-y-4">
                <Button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 text-lg"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;