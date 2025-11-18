export interface RenderOptions {
  category: string;
  angle: number;
  mockupStyle: string;
  lighting: string;
  reflections: boolean;
  resolution: string;
  watermarkText: string;
}

export const CATEGORY_OPTIONS = ['Cosméticos', 'Eletrônicos', 'Alimentos & Bebidas', 'Vestuário', 'Artigos de Luxo'];
export const LIGHTING_OPTIONS = ['Softbox de Estúdio', 'Luz Solar Natural', 'Iluminação de Contorno Dramática', 'Cinematográfica', 'Neutra & Limpa'];
export const RESOLUTION_OPTIONS = [
  { value: '1024x1024', label: '1024x1024 (Quadrado)' },
  { value: '2048x2048', label: '2048x2048 (Quadrado HD)' },
  { value: '1024x1792', label: '1024x1792 (Retrato)' },
  { value: '1792x1024', label: '1792x1024 (Paisagem)' },
];
