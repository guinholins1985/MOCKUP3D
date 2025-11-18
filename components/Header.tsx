
import React from 'react';
import { PenTool } from './icons/PenTool';

export const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 text-center">
      <div className="inline-flex items-center justify-center bg-cyan-900/50 text-cyan-300 rounded-full p-3 mb-4 border border-cyan-700/50">
        <PenTool className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-cyan-300 sm:text-5xl">
        AI 3D Product Visualizer
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
        Transform your 2D product images into photorealistic 3D renders. Customize the scene, lighting, and details to create stunning visuals for your marketing needs.
      </p>
    </header>
  );
};
