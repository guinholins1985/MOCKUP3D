
import React from 'react';
import { Spinner } from './Spinner';
import { ImageIcon } from './icons/ImageIcon';

interface ImagePreviewProps {
  uploadedImage: string | null;
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
}

const Placeholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
    <ImageIcon className="w-24 h-24 mb-4 text-gray-700" />
    <h3 className="text-xl font-semibold text-gray-400">3D Preview Area</h3>
    <p className="mt-2 max-w-sm">Your generated product render will appear here. Upload an image and configure the scene to get started.</p>
  </div>
);

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  uploadedImage,
  generatedImage,
  isLoading,
  error,
}) => {
  const imageToDisplay = generatedImage || uploadedImage;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 bg-gray-900/50 rounded-2xl">
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 rounded-2xl backdrop-blur-sm">
          <Spinner />
          <p className="text-lg font-medium text-gray-200 mt-4">Generating your render...</p>
          <p className="text-sm text-gray-400 mt-1">This may take a moment.</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center z-10 rounded-2xl p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-200">Generation Failed</h3>
            <p className="text-sm text-red-300 mt-2">{error}</p>
          </div>
        </div>
      )}

      {imageToDisplay ? (
        <div className="w-full h-full flex items-center justify-center">
            <img
                src={imageToDisplay}
                alt={generatedImage ? "Generated 3D Render" : "Uploaded Product"}
                className="max-w-full max-h-full object-contain rounded-lg transition-opacity duration-500"
                style={{
                  maxHeight: 'calc(100vh - 12rem)', // Prevent image from being too large on tall screens
                }}
            />
        </div>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};
