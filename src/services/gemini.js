const { GoogleGenAI } = require("@google/genai");
const { SYSTEM_PROMPT, buildUserPrompt } = require("./prompt");

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("GEMINI_API_KEY is required");
    err.statusCode = 500;
    throw err;
  }
  return new GoogleGenAI({ apiKey });
}

async function generateCaptionWithGemini({ context }) {
  const genAI = getGeminiClient();
  const configuredModel = process.env.GEMINI_MODEL;
  const candidateModels = [
    configuredModel,
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-pro-latest",
  ].filter(Boolean);

  try {
    let lastErr = null;

    for (const modelName of candidateModels) {
      console.log(`[Gemini] Trying model: ${modelName}`);
      try {
        const result = await genAI.models.generateContent({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
          contents: buildUserPrompt({ context }),
          config: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        });

        const outputText = result?.text?.trim?.() || "";
        if (!outputText) {
          const err = new Error("Gemini returned empty output");
          err.statusCode = 502;
          throw err;
        }
        return outputText;
      } catch (inner) {
        lastErr = inner;
        const msg = String(inner?.message || inner || "");
        console.log(`[Gemini Error] Model ${modelName}: ${msg}`);
        // If it's a model-not-found / unsupported-method error, try next model.
        if (/404|not found|not supported/i.test(msg)) continue;
        throw inner;
      }
    }

    throw lastErr || new Error("Gemini error");
  } catch (e) {
    const msg = String(e?.message || e || "Gemini error");
    const err = new Error(msg);
    err.statusCode = /quota|exceeded|resource has been exhausted|429/i.test(msg)
      ? 429
      : 502;
    throw err;
  }
}

async function* generateCaptionWithGeminiStream({ context }) {
  const genAI = getGeminiClient();
  const configuredModel = process.env.GEMINI_MODEL;
  const candidateModels = [
    configuredModel,
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-pro-latest",
  ].filter(Boolean);

  let lastErr = null;

  for (const modelName of candidateModels) {
    console.log(`[Gemini Stream] Trying model: ${modelName}`);
    try {
      const stream = await genAI.models.generateContentStream({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        contents: buildUserPrompt({ context }),
        config: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });

      for await (const chunk of stream) {
        const text = chunk?.text || "";
        if (text) {
          yield { chunk: text, provider: "gemini", model: modelName };
        }
      }
      return;
    } catch (inner) {
      lastErr = inner;
      const msg = String(inner?.message || inner || "");
      console.log(`[Gemini Stream Error] Model ${modelName}: ${msg}`);
      if (/404|not found|not supported/i.test(msg)) continue;
      throw inner;
    }
  }

  throw lastErr || new Error("Gemini streaming error");
}

module.exports = {
  generateCaptionWithGemini,
  generateCaptionWithGeminiStream,
};

