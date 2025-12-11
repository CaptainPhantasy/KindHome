import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import type { MemoryRecord, ProcessingStatus } from '../../types';
import { MemoryCategory } from '../../types';

export const useMemoryTidier = () => {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [result, setResult] = useState<MemoryRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tidyMemory = useCallback(async (rawText: string) => {
    if (!rawText.trim()) {
      setError('Please say or type something first.');
      return;
    }

    setStatus('processing');
    setError(null);
    setResult(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key not found. Please ensure your environment is configured correctly.');
      }

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: rawText,
        config: {
          systemInstruction: `You are an expert archivist for a 'Memory Vault'. 
Your task is to take messy, spoken-word style input and convert it into a structured JSON record.

GUIDELINES:
1. Title: Create a short, descriptive title (3-5 words).
2. Memory Text: Clean up the input text to be grammatically correct and coherent. Remove filler words like 'um', 'uh', 'you know'. Preserve the original meaning and key details strictly.
3. Location: Extract specific locations mentioned (e.g., 'top shelf', 'garage', Grandma's house'). If no location is clear, return null.
4. Tags: Generate 3-5 relevant keywords for searchability.
5. Category: Classify into 'object', 'person', 'event', or 'other'.

Return ONLY valid JSON matching the specified schema.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Short title of the memory' },
              memory_text: { type: Type.STRING, description: 'Cleaned up sentence' },
              location: {
                type: Type.STRING,
                description: 'Detected location or null',
                nullable: true,
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of keywords',
              },
              category: {
                type: Type.STRING,
                enum: [MemoryCategory.OBJECT, MemoryCategory.PERSON, MemoryCategory.EVENT, MemoryCategory.OTHER],
                description: 'Category of the memory',
              },
            },
            required: ['title', 'memory_text', 'tags', 'category'],
          },
        },
      });

      const responseText = response.text;

      if (!responseText) {
        throw new Error('No response from AI.');
      }

      const structuredMemory = JSON.parse(responseText) as MemoryRecord;
      setResult(structuredMemory);
      setStatus('review');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while tidying up.';
      console.error('Memory processing failed:', err);
      setError(message);
      setStatus('error');
    }
  }, []);

  const saveMemory = useCallback(() => {
    setStatus('saved');
    setTimeout(() => {
      setStatus('idle');
      setResult(null);
    }, 2000);
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    tidyMemory,
    saveMemory,
    reset,
    status,
    result,
    error,
  };
};
