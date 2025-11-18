import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImagePreview } from './components/ImagePreview';
import { Header } from './components/Header';
import { generate3DRender, analyzeProductImage } from './services/geminiService';
import type { RenderOptions } from './types';

const defaultRenderOptions: RenderOptions = {
  category: 'Cosméticos',
  angle: 45,
  mockupStyle: 'Em uma superfície minimalista de mármore',
  lighting: 'Softbox de Estúdio',
  reflections: true,
  resolution: '1024x1024',
  watermarkText: '',
};

const App: React.FC = () => {
  const [renderOptions, setRenderOptions] = useState<RenderOptions>(defaultRenderOptions);

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyError("Chave de API não encontrada. Por favor, defina a variável de ambiente API_KEY.");
    }
  }, []);
  
  const handleImageUpload = (file: File) => {
    const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      setError('Tipo de arquivo inválido. Por favor, envie uma imagem PNG, JPG ou WEBP.');
      setUploadedImage(null);
      setImageBase64(null);
      return;
    }

    setUploadedImage(file);
    setGeneratedImage(null);
    setRenderOptions(defaultRenderOptions);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setImageBase64(base64Data);

      // Analyze image to get category and mockup style
      setIsAnalyzing(true);
      try {
        const result = await analyzeProductImage(base64Data.split(',')[1], file.type);
        setRenderOptions(prev => ({
          ...prev,
          category: result.category,
          mockupStyle: result.mockupStyle,
        }));
      } catch (err) {
        console.error("Image analysis failed:", err);
        // Do not set an error for the user, they can still proceed manually
      } finally {
        setIsAnalyzing(false);
      }
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
      setError('Por favor, envie uma imagem do produto primeiro.');
      return;
    }
     if (apiKeyError) {
      setError(apiKeyError);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const base64Data = imageBase64.split(',')[1];
      const result = await generate3DRender(renderOptions, base64Data, uploadedImage.type);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('network error')) {
           setError('Ocorreu um erro de rede. Por favor, verifique sua conexão e tente novamente.');
        } else {
           setError(err.message);
        }
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [renderOptions, uploadedImage, imageBase64, apiKeyError]);

  if (apiKeyError) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center p-4">
        <div className="text-center bg-gray-800 p-8 rounded-lg shadow-2xl border border-red-700/50">
          <h1 className="text-2xl font-bold mb-4">Erro de Configuração</h1>
          <p>{apiKeyError}</p>
          <p className="text-sm text-gray-400 mt-4">Esta aplicação requer uma chave da API Gemini para funcionar.</p>
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
            isAnalyzing={isAnalyzing}
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
        <p>Desenvolvido com a API Gemini. Criado para fins de demonstração.</p>
      </footer>
    </div>
  );
};

export default App;