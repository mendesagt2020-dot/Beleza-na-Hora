
import { GoogleGenAI } from "@google/genai";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Gera um novo penteado usando o modelo Gemini 2.5 Flash Image.
 * Cria uma nova instância a cada chamada para capturar mudanças na chave de API do ambiente.
 */
export async function generateHairstyle(base64Image: string, hairstylePrompt: string, retryCount = 0): Promise<string> {
  // Criar instância aqui garante o uso da chave atualizada do processo (através de process.env.API_KEY)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const prompt = `Professional high-end hair transformation.
                  Hairstyle: ${hairstylePrompt}. 
                  Instructions: Maintain the exact facial features, skin tone, and identity of the person. 
                  Only modify the hair. Professional studio lighting.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType: 'image/jpeg' } },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: { 
          aspectRatio: "1:1"
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("Modelo sem resposta");
    }

    // SEMPRE iterar através de todas as partes para encontrar o dado da imagem, não assumir que é a primeira
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    if (part?.inlineData?.data) {
      const mime = part.inlineData.mimeType || 'image/png';
      return `data:${mime};base64,${part.inlineData.data}`;
    }

    throw new Error("Conteúdo de imagem ausente");
  } catch (error: any) {
    const isQuotaError = 
      error?.status === 'RESOURCE_EXHAUSTED' || 
      error?.message?.includes('429') || 
      error?.message?.includes('quota');

    if (isQuotaError && retryCount < 2) {
      console.warn(`[RETRY] Limite atingido. Aguardando cool-down...`);
      await delay(30000); // 30s de pausa forçada para tentar resetar a janela de RPM
      return generateHairstyle(base64Image, hairstylePrompt, retryCount + 1);
    }
    
    throw error;
  }
}
