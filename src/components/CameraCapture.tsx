
import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, CameraOff, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CameraCaptureProps {
  onImageCapture: (imageDataUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CameraCapture = ({
  onImageCapture,
  isOpen,
  onClose
}: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setCapturedImage(null);
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
      }
    }
  };

  const handleConfirmCapture = () => {
    if (capturedImage) {
      onImageCapture(capturedImage);
      stopCamera();
      onClose();
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isStreaming) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  };

  useEffect(() => {
    if (isOpen && !isStreaming && !capturedImage) {
      startCamera();
    }
    
    return () => {
      if (!isOpen) {
        stopCamera();
      }
    };
  }, [isOpen, startCamera, stopCamera, isStreaming, capturedImage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ambil Foto Makanan</h3>
              <Button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}
              
              {/* Camera Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                {!capturedImage ? (
                  <>
                    <Button
                      onClick={switchCamera}
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={capturePhoto}
                      disabled={!isStreaming}
                      className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 text-gray-800"
                    >
                      <Camera className="w-6 h-6" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleRetakePhoto}
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                    >
                      <X className="w-4 h-4" />
                      Ulangi
                    </Button>
                    
                    <Button
                      onClick={handleConfirmCapture}
                      className="rounded-full bg-green-500 hover:bg-green-600"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Gunakan Foto
                    </Button>
                  </>
                )}
              </div>
            </div>

            {!isStreaming && !capturedImage && (
              <div className="text-center py-8">
                <CameraOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Kamera tidak aktif</p>
                <Button onClick={startCamera}>
                  <Camera className="w-4 h-4 mr-2" />
                  Aktifkan Kamera
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
