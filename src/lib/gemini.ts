import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY not set — AI features will fail");
}

const client = new GoogleGenAI({ apiKey: apiKey || "" });

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

export async function generateText(prompt: string): Promise<string> {
  try {
    const response = await client.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return text.trim();
  } catch (err) {
    // Fallback to backup model
    const response = await client.models.generateContent({
      model: FALLBACK_MODEL,
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error("Both primary and fallback models returned empty response");
    }
    return text.trim();
  }
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const jsonPrompt = prompt + "\n\nRespond ONLY with valid JSON. No markdown, no code fences, no extra text.";
  const config = { responseMimeType: "application/json" as const };

  try {
    const response = await client.models.generateContent({
      model: PRIMARY_MODEL,
      contents: jsonPrompt,
      config,
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as T;
  } catch (err) {
    // Fallback to backup model
    const response = await client.models.generateContent({
      model: FALLBACK_MODEL,
      contents: jsonPrompt,
      config,
    });

    const text = response.text;
    if (!text) {
      throw new Error("Both primary and fallback models returned empty response");
    }
    return JSON.parse(text) as T;
  }
}
