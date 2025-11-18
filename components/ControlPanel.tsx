
import React, { useRef } from 'react';
import type { RenderOptions } from '../types';
import { UploadCloud, Sparkles } from './icons/Icons';
import { ToggleSwitch } from './ToggleSwitch';

interface ControlPanelProps {
  options: RenderOptions;
  setOptions: React.Dispatch<React.SetStateAction<RenderOptions>>;
  onImageUpload: (file: File) => void;
  onGenerate: () => void;
  isLoading: boolean;
  uploadedFileName?: string;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-lg font-semibold text-cyan-300 mb-4">{children}</h3>
);

const Label: React.FC<{ htmlFor: string; children: React.ReactNode, subtext?: string }> = ({ htmlFor, children, subtext }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-2">
    {children}
    {subtext && <span className="block text-xs text-gray-500">{subtext}</span>}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition appearance-none bg-no-repeat bg-right pr-8"
    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
  />
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
  options,
  setOptions,
  onImageUpload,
  onGenerate,
  isLoading,
  uploadedFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleOptionChange = (field: keyof RenderOptions, value: any) => {
    setOptions(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>1. Upload Product Image</SectionTitle>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        <button
          onClick={handleUploadClick}
          className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 hover:border-cyan-500 transition-colors duration-300 bg-gray-900/50"
        >
          <UploadCloud className="w-10 h-10 text-gray-500 mb-2" />
          <span className="text-sm font-semibold text-cyan-400">Click to upload</span>
          <span className="text-xs text-gray-500">PNG, JPG, or WEBP</span>
        </button>
        {uploadedFileName && <p className="text-xs text-gray-400 mt-2 truncate text-center">File: {uploadedFileName}</p>}
      </div>

      <div>
        <SectionTitle>2. Configure Scene</SectionTitle>
        <div className="space-y-6">
          <div>
            <Label htmlFor="category">Product Category</Label>
            <Select id="category" value={options.category} onChange={e => handleOptionChange('category', e.target.value)}>
              <option>Cosmetics</option>
              <option>Electronics</option>
              <option>Food & Beverage</option>
              <option>Apparel</option>
              <option>Luxury Goods</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="mockupStyle">Background / Scenario</Label>
            <Input id="mockupStyle" type="text" value={options.mockupStyle} onChange={e => handleOptionChange('mockupStyle', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="angle">Rotation Angle ({options.angle}°)</Label>
            <input
              id="angle"
              type="range"
              min="0"
              max="360"
              value={options.angle}
              onChange={e => handleOptionChange('angle', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>
      
      <div>
        <SectionTitle>3. Fine-Tune Details</SectionTitle>
        <div className="space-y-6">
           <div>
            <Label htmlFor="lighting">Lighting Style</Label>
            <Select id="lighting" value={options.lighting} onChange={e => handleOptionChange('lighting', e.target.value)}>
              <option>Studio Softbox</option>
              <option>Natural Sunlight</option>
              <option>Dramatic Rim Lighting</option>
              <option>Cinematic</option>
              <option>Neutral & Clean</option>
            </Select>
          </div>
          <div>
             <Label htmlFor="reflections">Surface Reflections</Label>
             <ToggleSwitch
                enabled={options.reflections}
                onChange={value => handleOptionChange('reflections', value)}
             />
          </div>
          <div>
            <Label htmlFor="resolution">Output Resolution</Label>
            <Select id="resolution" value={options.resolution} onChange={e => handleOptionChange('resolution', e.target.value)}>
              <option>1024x1024</option>
              <option>2048x2048</option>
              <option>1024x1792</option>
              <option>1792x1024</option>
            </Select>
          </div>
           <div>
            <Label htmlFor="watermarkText">Watermark (optional)</Label>
            <Input id="watermarkText" type="text" placeholder="e.g., Your Brand" value={options.watermarkText} onChange={e => handleOptionChange('watermarkText', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading || !uploadedFileName}
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate 3D Render
            </>
          )}
        </button>
      </div>
    </div>
  );
};
