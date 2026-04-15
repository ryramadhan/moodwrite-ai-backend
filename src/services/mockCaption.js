// Fallback responses when AI quota is exhausted
// Provides professional, neutral, and informative responses

const PROFESSIONAL_FALLBACKS = [
  "Terima kasih atas pertanyaan Anda. Saat ini sistem sedang mengalami keterbatasan, namun kami akan membantu sebaik mungkin.",
  "Permintaan Anda telah diterima. Mohon maaf atas keterbatasan layanan saat ini.",
  "Kami memahami kebutuhan Anda. Sistem sedang dalam mode fallback, mohon bersabar.",
  "Informasi yang Anda butuhkan sedang diproses. Ada keterbatasan teknis saat ini.",
];

function getRandomFallback() {
  const index = Math.floor(Math.random() * PROFESSIONAL_FALLBACKS.length);
  return PROFESSIONAL_FALLBACKS[index];
}

function generateMockCaption({ context }) {
  const cleanedContext = typeof context === "string" ? context.trim() : "";

  if (!cleanedContext) {
    return getRandomFallback();
  }

  // Provide a simple acknowledgment response based on context length
  if (cleanedContext.length < 50) {
    return `Anda menyampaikan: "${cleanedContext}". Mohon maaf, sistem sedang dalam mode terbatas dan tidak dapat memberikan respons lengkap saat ini.`;
  }

  return `Kami menerima permintaan Anda terkait "${cleanedContext.substring(0, 50)}...". Saat ini layanan AI sedang tidak tersedia penuh. Mohon coba lagi nanti.`;
}

module.exports = {
  generateMockCaption,
};

