import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "⚠️  GEMINI_API_KEY is not set. AI chatbot features will not work."
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export function getGeminiModel() {
  return genAI.getGenerativeModel({ model: modelName });
}

export { genAI, modelName };
