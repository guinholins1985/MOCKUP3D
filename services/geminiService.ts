
import { GoogleGenAI, Modality } from "@google/genai";
import type { RenderOptions } from '../types';

const buildPrompt = (options: RenderOptions): string => {
  const { category, angle, mockupStyle, lighting, reflections, resolution, watermarkText } = options;

  const reflectionText = reflections
    ? 'Include realistic, high-fidelity reflections on the product surface.'
    : 'The product should have a matte finish, with no direct or specular reflections.';

  const watermarkPromptSection = watermarkText
    ? `Add a subtle, professional text watermark in the bottom-right corner with the text: "${watermarkText}".`
    : "Do not add any watermark.";

  return `
You are an art director and 3D rendering specialist, focused on creating photorealistic product visualizations for marketing and e-commerce. Your attention to detail is impeccable, and your goal is to produce an image indistinguishable from a professional photograph.

# Main Task
Generate a SINGLE high-quality, photorealistic 3D product image from the provided 2D product image.

# Product Context
- Category: ${category}
- 2D Reference Image: [Attached]

# Step-by-Step Process
Follow these steps rigorously:

1.  **3D Analysis and Modeling:**
    - Analyze the attached 2D image to fully understand the product's geometry, proportions, materials, textures, and branding.
    - Create a digitally accurate 3D model. Fidelity to the original product is the most important criterion.

2.  **Scene Composition:**
    - **Positioning:** Render the 3D model at the specified viewing angle.
    - **Rotation Angle (Y-Axis):** ${angle} degrees.
    - **Scenario:** Place the 3D model in the following environment: "${mockupStyle}". The scenario should complement the product, never overshadow it. The primary focus is the product.

3.  **Lighting and Rendering:**
    - **Lighting Style:** Apply a professional "${lighting}" lighting scheme. The lighting should realistically highlight the product's contours and textures.
    - **Surface Effects:** ${reflectionText} Reflections should be subtle and physically accurate, corresponding to the lighting and environment.

4.  **Finalization and Details:**
    - **Output Quality:** The final image must be rendered in the highest quality, with sharp details and no digital artifacts, suitable for a ${resolution} resolution.
    - ${watermarkPromptSection}

# Critical Rules and Restrictions
- **IMAGE ONLY:** The only allowed output is the final image. DO NOT include text, captions, explanations, code, or anything else in your response. The response must be only the image content.
- **NO DISTORTION:** Do not alter the original product's design, colors, or branding.
- **PHOTOREALISM:** The final result must look like a real photograph, not an obvious computer rendering.
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
      throw new Error('API response was empty or invalid. No candidates found.');
    }
    
    if (candidate.finishReason && ['SAFETY', 'RECITATION', 'OTHER'].includes(candidate.finishReason)) {
      throw new Error(`Image generation failed. The prompt may have been blocked for safety or other reasons (Reason: ${candidate.finishReason}).`);
    }

    const imagePart = candidate.content?.parts?.find(part => 'inlineData' in part);

    if (imagePart && 'inlineData' in imagePart && imagePart.inlineData) {
      const generatedImageBase64 = imagePart.inlineData.data;
      const generatedImageMimeType = imagePart.inlineData.mimeType;
      return `data:${generatedImageMimeType};base64,${generatedImageBase64}`;
    }
    
    const textResponse = response.text?.trim();
    if (textResponse) {
      throw new Error(`API returned text instead of an image: "${textResponse}"`);
    }
    
    throw new Error('No image data found in the API response. The model may have failed to generate an image.');
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while generating the 3D render.");
  }
};
