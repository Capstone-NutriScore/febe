import * as tf from '@tensorflow/tfjs';

// Interface untuk hasil prediksi
interface PredictionResult {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fibre: number;
  nat: number;
  foodName?: string;
  confidence?: number;
}

// Load model dari file
export const loadModel = async (modelPath: string = '/model.json') => {
  try {
    console.log('Loading TensorFlow.js model...');
    
    // Set backend ke WebGL untuk performa yang lebih baik
    await tf.setBackend('webgl');
    
    // Load model
    const model = await tf.loadGraphModel(modelPath);
    
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error(`Failed to load model: ${error}`);
  }
};

// Preprocess gambar untuk model
export const preprocessImage = async (imageDataUrl: string, targetSize: [number, number] = [224, 224]) => {
  return new Promise<tf.Tensor>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Buat canvas untuk resize gambar
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = targetSize[0];
        canvas.height = targetSize[1];
        
        // Draw dan resize gambar
        ctx.drawImage(img, 0, 0, targetSize[0], targetSize[1]);
        
        // Convert ke tensor dan preprocess
        const tensor = tf.browser.fromPixels(canvas)
          .resizeBilinear([224, 224])
          .toFloat()
          .expandDims(0)
          .div(255.0); // Normalize ke [0, 1]
        
        console.log('Image preprocessed, tensor shape:', tensor.shape);
        resolve(tensor);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageDataUrl;
  });
};

// Helper function untuk mendapatkan nama makanan
const getFoodName = async (predictionData: Float32Array | Int32Array | Uint8Array): Promise<string> => {
  try {
    // Ambil label dari file labels.json
    const response = await fetch('/labels.json');
    if (!response.ok) {
      throw new Error('Failed to load labels');
    }
    
    const labels = await response.json();
    
    // Temukan kelas dengan probabilitas tertinggi
    const maxIndex = Array.from(predictionData).indexOf(Math.max(...Array.from(predictionData)));
    console.log('Highest probability at index:', maxIndex, 'with value:', Math.max(...Array.from(predictionData)));
    
    // Gunakan label dari file jika tersedia
    if (Array.isArray(labels) && labels.length > 0 && maxIndex < labels.length) {
      console.log('Selected food:', labels[maxIndex]);
      return labels[maxIndex];
    } else {
      return 'Makanan Tidak Dikenal';
    }
  } catch (error) {
    console.error('Error loading labels:', error);
    return 'Makanan Tidak Dikenal';
  }
};

// Prediksi nutrisi dari gambar
export const predictNutrition = async (model: tf.GraphModel, imageDataUrl: string): Promise<PredictionResult> => {
  try {
    console.log('Starting nutrition prediction...');
    
    // Preprocess gambar
    const preprocessedImage = await preprocessImage(imageDataUrl);
    
    // Lakukan prediksi
    const prediction = await model.predict(preprocessedImage) as tf.Tensor;
    
    // Convert hasil prediksi ke array
    const predictionData = await prediction.data();
    
    console.log('Raw prediction data:', predictionData);
    
    // Cleanup tensors
    tf.dispose([preprocessedImage, prediction]);
    
    // Tambahkan nama makanan berdasarkan klasifikasi
    const foodName = await getFoodName(predictionData);
    
    // Nilai nutrisi default
    let calories = 250;
    let protein = 15;
    let carbohydrates = 40;
    let fat = 10;
    let fibre = 5;
    let nat = 300;
    
    // Sesuaikan nilai nutrisi berdasarkan jenis makanan
    if (foodName.toLowerCase().includes('telur')) {
      calories = 150;
      protein = 13;
      carbohydrates = 1;
      fat = 11;
      fibre = 0;
      nat = 124;
    } else if (foodName.toLowerCase().includes('nasi goreng')) {
      calories = 267;
      protein = 5.7;
      carbohydrates = 45.6;
      fat = 6.8;
      fibre = 1.2;
      nat = 396;
    } else if (foodName.toLowerCase().includes('ayam')) {
      calories = 165;
      protein = 31;
      carbohydrates = 0;
      fat = 3.6;
      fibre = 0;
      nat = 74;
    } else if (foodName.toLowerCase().includes('bakso')) {
      calories = 232;
      protein = 14.5;
      carbohydrates = 13.5;
      fat = 14.6;
      fibre = 0.8;
      nat = 592;
    } else if (foodName.toLowerCase().includes('sayur')) {
      calories = 65;
      protein = 3;
      carbohydrates = 11;
      fat = 0.5;
      fibre = 4;
      nat = 15;
    }
    
    // Mapping hasil prediksi ke struktur nutrisi
    const result: PredictionResult = {
      calories: calories,
      protein: protein,
      carbohydrates: carbohydrates,
      fat: fat,
      fibre: fibre,
      nat: nat,
      foodName: foodName,
      confidence: Math.max(0.7, Math.max(...Array.from(predictionData)))
    };
    
    console.log('Prediction result:', result);
    return result;
  } catch (error) {
    console.error('Error during prediction:', error);
    throw new Error(`Prediction failed: ${error}`);
  }
};

// Helper function untuk warmup model
export const warmupModel = async (model: tf.GraphModel) => {
  try {
    console.log('Warming up model...');
    
    // Buat dummy input untuk warmup
    const dummyInput = tf.zeros([1, 224, 224, 3]);
    const warmupResult = await model.predict(dummyInput);
    
    // Cleanup
    tf.dispose([dummyInput, warmupResult]);
    
    console.log('Model warmup completed');
  } catch (error) {
    console.error('Error during model warmup:', error);
  }
};

// Utility untuk check WebGL support
export const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (error) {
    return false;
  }
};