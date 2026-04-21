const {
  generateCaptionWithGemini,
  generateCaptionWithGeminiStream,
} = require("./gemini");
const { generateMockCaption } = require("./mockCaption");

function isQuotaOrBillingError(err) {
  const msg = String(err?.message || "").toLowerCase();
  return (
    err?.statusCode === 429 ||
    /quota|billing|rate limit|resource has been exhausted|too many requests/.test(
      msg
    )
  );
}

async function generateCaptionAny({ context }) {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  if (provider !== "gemini") {
    const err = new Error("Invalid AI_PROVIDER. Use: gemini");
    err.statusCode = 500;
    throw err;
  }

  const fallbackMock =
    (process.env.AI_FALLBACK_MOCK || "true").toLowerCase() !== "false";

  try {
    const result = await generateCaptionWithGemini({ context });
    return { result, provider: "gemini" };
  } catch (err) {
    console.log("[AI Error]", err?.message, "Status:", err?.statusCode);
    if (fallbackMock && isQuotaOrBillingError(err)) {
      console.log("[Fallback] Using mock response");
      const result = generateMockCaption({ context });
      return { result, provider: "mock" };
    }
    throw err;
  }
}

async function* generateCaptionAnyStream({ context }) {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  if (provider !== "gemini") {
    const err = new Error("Invalid AI_PROVIDER. Use: gemini");
    err.statusCode = 500;
    throw err;
  }

  const fallbackMock =
    (process.env.AI_FALLBACK_MOCK || "true").toLowerCase() !== "false";

  try {
    for await (const data of generateCaptionWithGeminiStream({ context })) {
      yield data;
    }
  } catch (err) {
    console.log("[AI Stream Error]", err?.message, "Status:", err?.statusCode);
    if (fallbackMock && isQuotaOrBillingError(err)) {
      console.log("[Fallback Stream] Using mock response");
      const result = generateMockCaption({ context });
      // Simulate streaming by yielding word by word
      const words = result.split(/(\s+)/);
      for (const word of words) {
        if (word) {
          yield { chunk: word, provider: "mock", model: "mock" };
          // Small delay to simulate streaming
          await new Promise((r) => setTimeout(r, 10));
        }
      }
      return;
    }
    throw err;
  }
}

module.exports = {
  generateCaptionAny,
  generateCaptionAnyStream,
};

