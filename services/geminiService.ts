import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client only if the key exists to avoid immediate errors on load if missing
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generatePersonalizedQuote = async (name: string): Promise<string> => {
  if (!ai) {
    console.warn("API Key not found, falling back to static quotes.");
    throw new Error("API Key missing");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, unique, deeply inspirational quote specifically for someone named ${name}. 
      Focus on potential, future success, and gratitude. 
      Keep it under 25 words. 
      Do not use quotes from famous people, generate a new one. 
      Do not include the name in the quote text itself, just the message.`,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating quote:", error);
    throw error;
  }
};
