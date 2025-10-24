
import { GoogleGenAI } from "@google/genai";

// Ensure API_KEY is set in your environment variables for this to work.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateBio = async (keywords: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI functionality is disabled. Please configure the API Key.");
  }
  try {
    const prompt = `Generate a compelling, short, and professional influencer bio (around 2-3 sentences) based on these keywords: "${keywords}". The bio should be engaging and suitable for social media profiles. Do not use hashtags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating bio with Gemini API:", error);
    return "There was an error generating the bio. Please try again.";
  }
};
