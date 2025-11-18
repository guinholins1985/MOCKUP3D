import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { RenderOptions } from '../types';
import { CATEGORY_OPTIONS } from '../types';

const buildPrompt = (options: RenderOptions): string => {
  const { category, angle, mockupStyle, lighting, reflections, resolution, watermarkText } = options;

  const reflectionText = reflections
    ? 'Inclua reflexos realistas e de alta fidelidade na superfície do produto.'
    : 'O produto deve ter um acabamento fosco, sem reflexos diretos ou especulares.';

  const watermarkPromptSection = watermarkText
    ? `Adicione uma marca d'água de texto sutil e profissional no canto inferior direito com o texto: "${watermarkText}".`
    : "Não adicione nenhuma marca d'água.";

  return `
Você é um diretor de arte e especialista em renderização 3D, focado em criar visualizações de produtos fotorrealistas para marketing e e-commerce. Sua atenção aos detalhes é impecável, e seu objetivo é produzir uma imagem indistinguível de uma fotografia profissional.

# Tarefa Principal
Gerar uma ÚNICA imagem de produto 3D, fotorrealista e de alta qualidade, a partir da imagem 2D do produto fornecida.

# Contexto do Produto
- Categoria: ${category}
- Imagem de Referência 2D: [Anexada]

# Processo Passo a Passo
Siga estas etapas rigorosamente:

1.  **Análise e Modelagem 3D:**
    - Analise a imagem 2D anexada para entender completamente a geometria, proporções, materiais, texturas e marca do produto.
    - Crie um modelo 3D digitalmente preciso. A fidelidade ao produto original é o critério mais importante.

2.  **Composição da Cena:**
    - **Posicionamento:** Renderize o modelo 3D no ângulo de visão especificado.
    - **Ângulo de Rotação (Eixo Y):** ${angle} graus.
    - **Cenário:** Posicione o modelo 3D no seguinte ambiente: "${mockupStyle}". O cenário deve complementar o produto, nunca ofuscá-lo. O foco principal é o produto.

3.  **Iluminação e Renderização:**
    - **Estilo de Iluminação:** Aplique um esquema de iluminação profissional de "${lighting}". A iluminação deve realçar os contornos e texturas do produto de forma realista.
    - **Efeitos de Superfície:** ${reflectionText} Os reflexos devem ser sutis e fisicamente corretos, correspondendo à iluminação e ao ambiente.

4.  **Finalização e Detalhes:**
    - **Qualidade de Saída:** A imagem final deve ser renderizada com a mais alta qualidade, com detalhes nítidos e sem artefatos digitais, adequada para uma resolução de ${resolution}.
    - ${watermarkPromptSection}

# Regras e Restrições Críticas
- **SOMENTE IMAGEM:** O único resultado permitido é a imagem final. NÃO inclua texto, legendas, explicações, código, ou qualquer outra coisa na sua resposta. A resposta deve ser apenas o conteúdo da imagem.
- **SEM DISTORÇÃO:** Não altere o design, as cores ou a marca do produto original.
- **FOTORREALISMO:** O resultado final deve parecer uma fotografia real, não uma renderização de computador óbvia.
  `;
};

export const generate3DRender = async (
  options: RenderOptions,
  imageBase64: string,
  mimeType: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = buildPrompt(options);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const candidate = response.candidates?.[0];
    
    if (!candidate) {
      throw new Error('A resposta da API estava vazia ou inválida. Nenhum candidato encontrado.');
    }
    
    if (candidate.finishReason && ['SAFETY', 'RECITATION', 'OTHER'].includes(candidate.finishReason)) {
      throw new Error(`A geração da imagem falhou. O prompt pode ter sido bloqueado por segurança ou outros motivos (Motivo: ${candidate.finishReason}).`);
    }

    const imagePart = candidate.content?.parts?.find(part => 'inlineData' in part);

    if (imagePart && 'inlineData' in imagePart && imagePart.inlineData) {
      const generatedImageBase64 = imagePart.inlineData.data;
      const generatedImageMimeType = imagePart.inlineData.mimeType;
      return `data:${generatedImageMimeType};base64,${generatedImageBase64}`;
    }
    
    const textResponse = response.text?.trim();
    if (textResponse) {
      throw new Error(`A API retornou texto em vez de uma imagem: "${textResponse}"`);
    }
    
    throw new Error('Nenhum dado de imagem encontrado na resposta da API. O modelo pode ter falhado ao gerar uma imagem.');
  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Ocorreu um erro desconhecido ao gerar a renderização 3D.");
  }
};

export const analyzeProductImage = async (
  imageBase64: string,
  mimeType: string
): Promise<{ category: string; mockupStyle: string; }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const prompt = `
You are a creative director specializing in product photography. Your task is to analyze a product image and suggest the best scene composition for a photorealistic 3D render.

Analyze the provided image.

Respond ONLY with a valid JSON object. Do not include any other text or markdown formatting.

Your JSON response must contain:
1. "category": A string. Classify the product into one of the following exact categories: ${JSON.stringify(CATEGORY_OPTIONS)}. Choose the most fitting category.
2. "mockupStyle": A string. Describe a creative, suitable, and complementary background scenario for the product, in Portuguese. Be descriptive and concise (e.g., "Sobre uma mesa de madeira rústica com grãos de café espalhados", "Flutuando em um ambiente minimalista de gravidade zero com neons suaves", "Em uma superfície de ardósia escura e úmida com gotas de água").
`;
  
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            mockupStyle: { type: Type.STRING },
          },
          required: ['category', 'mockupStyle'],
        },
      },
    }
  );

  const jsonText = response.text.trim();
  const result = JSON.parse(jsonText);

  // Validate that the returned category is one of the allowed options
  if (!CATEGORY_OPTIONS.includes(result.category)) {
      // If not, default to the first option to avoid breaking the UI
      console.warn(`Model returned an invalid category: '${result.category}'. Defaulting to '${CATEGORY_OPTIONS[0]}'.`);
      result.category = CATEGORY_OPTIONS[0];
  }

  return result;
}
