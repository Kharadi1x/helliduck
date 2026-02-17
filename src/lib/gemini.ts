import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY not set — AI features will fail");
}

const client = new GoogleGenAI({ apiKey: apiKey || "" });

export async function generateText(prompt: string): Promise<string> {
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned empty response");
  }
  return text.trim();
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt + "\n\nRespond ONLY with valid JSON. No markdown, no code fences, no extra text.",
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned empty response");
  }
  return JSON.parse(text) as T;
}
