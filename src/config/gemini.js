import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize the Google Generative AI client
// Note: Client-side API key usage is suitable for prototyping.
// For production apps, call Gemini through a backend API proxy to secure credentials.
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  if (!genAI) {
    console.warn('Gemini API Key is missing. Gemini services will be unavailable.');
    return null;
  }
  return genAI.getGenerativeModel({ model: modelName });
};

export default genAI;
