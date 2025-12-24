
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_API_KEY || "";

if (!API_KEY) {
  console.warn("Missing VITE_API_KEY environment variable. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = (modelName: string = "gemini-1.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};
