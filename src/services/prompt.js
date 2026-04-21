const SYSTEM_PROMPT =
    "You are a helpful AI assistant. Provide clear, professional, and informative responses. Use standard language that is easy to understand. Be concise, accurate, and directly relevant to the user's input. Avoid overly emotional, artistic, or flowery language. Focus on delivering practical and useful information.";

function buildUserPrompt({ context }) {
    const cleanedContext = typeof context === "string" ? context.trim() : "";
    return cleanedContext || "No input provided.";
}

module.exports = {
    SYSTEM_PROMPT,
    buildUserPrompt,
};