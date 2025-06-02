
import { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  onImageSelect: (imageDataUrl: string) => void;
  selectedImage: string | null;
}

export const ImageUploader = ({
  onImageSelect,
  selectedImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearImage = () => {
    onImageSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!selectedImage ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Upload gambar makanan
            </p>
            <p className="text-sm text-gray-500">
              Drag & drop atau klik untuk memilih file
            </p>
          </div>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="mt-4"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Pilih Gambar
          </Button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={selectedImage}
            alt="Selected food"
            className="w-full max-h-80 object-cover rounded-lg shadow-lg"
          />
          
          <Button
            onClick={clearImage}
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2 p-2"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            Gambar siap dianalisis
          </div>
        </div>
      )}
    </div>
  );
};
