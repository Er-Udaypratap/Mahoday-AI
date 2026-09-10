import { COLLEGE_CONTEXT } from "./collegeData";

// NOTE: This key is exposed client-side because there is no backend in
// this test build. Do NOT ship this version publicly - anyone can read
// the key from browser dev tools. Use only for local/private testing.
const GEMINI_API_KEY = "AQ.Ab8RN6KTr7UHpaEiLyBUWpnwobFSTsLqPZErdhju9rFlMvnA0g";

const MODEL_FALLBACK_CHAIN = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

const GREETING_PATTERN = /^\s*(namaste|hi|hello|hey)[!,.\s-]*/i;

function cleanReply(text: string): string {
  return text.replace(GREETING_PATTERN, "").trim();
}

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

function buildPayload(message: string, imageBase64?: string | null) {
  const parts: GeminiPart[] = [
    { text: `${COLLEGE_CONTEXT}\n\nStudent's question: ${message}` },
  ];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
  }
  return {
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
  };
}

async function callModel(model: string, payload: unknown, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function extractText(json: any): { text: string | null; finishReason: string | null } {
  const candidates = json?.candidates;
  if (!candidates || candidates.length === 0) return { text: null, finishReason: null };
  const finishReason = candidates[0]?.finishReason ?? null;
  const parts = candidates[0]?.content?.parts ?? [];
  const text = parts.map((p: GeminiPart) => p.text ?? "").join("");
  return { text: text || null, finishReason };
}

export async function askMahoday(
  message: string,
  imageBase64?: string | null
): Promise<string> {
  const payload = buildPayload(message, imageBase64);
  const errors: string[] = [];

  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      const res = await callModel(model, payload);
      if (res.ok) {
        const json = await res.json();
        const { text, finishReason } = extractText(json);
        if (text) {
          let cleaned = cleanReply(text);
          if (finishReason === "MAX_TOKENS") {
            cleaned += "\n\n(Reply was long, trimmed a bit - ask a specific detail for more.)";
          }
          return cleaned;
        }
        errors.push(`${model}: empty response`);
        continue;
      } else if (res.status === 503) {
        errors.push(`${model}: 503 overloaded`);
        continue;
      } else {
        const body = await res.text();
        errors.push(`${model}: ${res.status} ${body.slice(0, 120)}`);
        continue;
      }
    } catch (e: any) {
      errors.push(`${model}: ${e?.name || "error"}`);
      continue;
    }
  }

  return `Mahoday couldn't get a response right now. Debug: ${errors.slice(-3).join(" | ")}`;
}
