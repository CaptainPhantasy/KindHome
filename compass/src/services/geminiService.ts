import { GoogleGenAI, Type, Modality } from '@google/genai';
import type { MedicationData, IdentificationData } from '../../types';

const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Configuration Error: Missing Gemini API Key. Please check your settings.');
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeMedicationImage = async (base64Image: string): Promise<MedicationData> => {
  const ai = getAI();
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } },
        {
          text: `Analyze this image.
1) Determine if the main subject is a medication.
2) If yes, extract: medication_name, dosage, frequency, time_of_day, purpose, confidence_score (0-1).
3) If no, identify what it is in medication_name and set is_medication: false.
Return strict JSON.`,
        },
      ],
    },
    config: {
      thinkingConfig: { thinkingBudget: 2048 },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_medication: { type: Type.BOOLEAN },
          medication_name: { type: Type.STRING },
          dosage: { type: Type.STRING },
          frequency: { type: Type.STRING },
          time_of_day: { type: Type.STRING },
          purpose: { type: Type.STRING },
          confidence_score: { type: Type.NUMBER },
        },
        required: ['is_medication', 'medication_name'],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error('API Error: No data returned from Gemini.');
  return JSON.parse(text) as MedicationData;
};

export const identifyObjectWithThinking = async (base64Image: string): Promise<IdentificationData> => {
  const ai = getAI();
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } },
        {
          text: "Identify this object. Be specific (e.g., 'This is a AAA battery'). Be concise (<=2 sentences) and friendly for an elderly person.",
        },
      ],
    },
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          is_hazardous: { type: Type.BOOLEAN },
        },
        required: ['description', 'is_hazardous'],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error('No identification returned');
  return JSON.parse(text) as IdentificationData;
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;

  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};