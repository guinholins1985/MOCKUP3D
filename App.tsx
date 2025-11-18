
import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImagePreview } from './components/ImagePreview';
import { Header } from './components/Header';
import { generate3DRender } from './services/geminiService';
import type { RenderOptions } from './types';

const App: React.FC = () => {
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
    category: 'Cosmetics',
    angle: 45,
    mockupStyle: 'On a minimalist marble surface',
    lighting: 'Studio Softbox',
    reflections: true,
    resolution: '1024x1024',
    watermarkText: '',
  });

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyError("API Key is missing. Please set the API_KEY environment variable.");
    }
  }, []);
  
  const handleImageUpload = (file: File) => {
    const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PNG, JPG, or WEBP image.');
      setUploadedImage(null);
      setImageBase64(null);
      return;
    }

    setUploadedImage(file);
    setGeneratedImage(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleOptionsChange = (newOptions: React.SetStateAction<RenderOptions>) => {
    setRenderOptions(newOptions);
    if (error) {
      setError(null);
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!uploadedImage || !imageBase64) {
      setError('Please upload a product image first.');
      return;
    }
     if (apiKeyError) {
      setError(apiKeyError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Data = imageBase64.split(',')[1];
      const result = await generate3DRender(renderOptions, base64Data, uploadedImage.type);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('network error')) {
           setError('A network error occurred. Please check your connection and try again.');
        } else {
           setError(err.message);
        }
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [renderOptions, uploadedImage, imageBase64, apiKeyError]);

  if (apiKeyError) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center p-4">
        <div className="text-center bg-gray-800 p-8 rounded-lg shadow-2xl border border-red-700/50">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p>{apiKeyError}</p>
          <p className="text-sm text-gray-400 mt-4">This application requires a Gemini API key to function.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 xl:col-span-3 bg-gray-800/50 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
          <ControlPanel
            options={renderOptions}
            setOptions={handleOptionsChange}
            onImageUpload={handleImageUpload}
            onGenerate={handleGenerateClick}
            isLoading={isLoading}
            uploadedFileName={uploadedImage?.name}
          />
        </div>
        <div className="lg:col-span-8 xl:col-span-9 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700/50 min-h-[60vh] lg:min-h-0 lg:h-full">
          <ImagePreview
            uploadedImage={imageBase64}
            generatedImage={generatedImage}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini API. Built for demonstration purposes.</p>
      </footer>
    </div>
  );
};

export default App;
