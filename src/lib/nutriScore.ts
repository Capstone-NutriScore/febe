// Fungsi untuk menghitung Nutri-Score yang disesuaikan dengan kebutuhan kalori pengguna

// Menghitung BMR berdasarkan Mifflin-St Jeor Equation
export const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  
  return bmr;
};

// Menghitung TDEE berdasarkan BMR dan tingkat aktivitas
export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const activityFactors: Record<string, number> = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very_active': 1.9
  };
  
  return Math.round(bmr * (activityFactors[activityLevel] || 1.2));
};

// Menghitung Nutri-Score yang disesuaikan
export const calculateAdjustedNutriScore = (
  calories: number,
  protein: number,
  carbohydrates: number,
  fat: number,
  fibre: number,
  sodium: number,
  tdee: number
): { score: string, value: number } => {
  // Skor negatif berdasarkan kandungan kalori, karbohidrat, lemak, dan natrium
  let negativeScore = 0;
  negativeScore += calories / 100;
  negativeScore += carbohydrates / 10; // Asumsi sebagian besar karbohidrat adalah gula
  negativeScore += fat / 3;
  negativeScore += sodium / 100; // Natrium dalam mg

  // Skor positif berdasarkan kandungan serat dan protein
  let positiveScore = 0;
  positiveScore += fibre / 2;
  positiveScore += protein / 5;

  // Skor bersih
  const netScore = negativeScore - positiveScore;

  // Penyesuaian berdasarkan TDEE pengguna
  // Kalori makanan sebagai persentase dari TDEE
  const caloriePercentage = calories / tdee;
  const adjustedScore = netScore * (caloriePercentage * 10);

  // Menentukan Nutri-Score berdasarkan skor yang disesuaikan
  let score = '';
  if (adjustedScore < -1) {
    score = 'A';
  } else if (adjustedScore < 2) {
    score = 'B';
  } else if (adjustedScore < 10) {
    score = 'C';
  } else if (adjustedScore < 18) {
    score = 'D';
  } else {
    score = 'E';
  }

  return { score, value: Math.round(adjustedScore * 10) / 10 };
};

// Mendapatkan warna berdasarkan Nutri-Score
export const getNutriScoreColor = (score: string): string => {
  switch (score) {
    case 'A':
      return 'bg-green-500';
    case 'B':
      return 'bg-light-green-500';
    case 'C':
      return 'bg-yellow-500';
    case 'D':
      return 'bg-orange-500';
    case 'E':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};