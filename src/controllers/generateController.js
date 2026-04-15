const { generateCaptionAny } = require("../services/ai");
const { insertCaption } = require("../services/captionsService");

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

// sanitize text input - remove potential harmful chars, limit length
function sanitizeContext(context) {
  if (!context || typeof context !== "string") return "";
  return context
    .replace(/[<>'"]/g, "")
    .trim()
    .slice(0, 2000);
}

async function generate(req, res) {
  const { context } = req.body ?? {};

  if (typeof context !== "string" || !context.trim()) {
    throw badRequest("Field 'context' is required");
  }

  const startedAt = Date.now();
  const sanitizedContext = sanitizeContext(context);
  const { result, provider } = await generateCaptionAny({
    context: sanitizedContext,
  });
  const latency = Date.now() - startedAt;

  await insertCaption({
    context: sanitizedContext,
    result,
  });

  res.json({
    result,
    provider,
    context: sanitizedContext,
    latency,
  });
}

module.exports = {
  generate,
};

