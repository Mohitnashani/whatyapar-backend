const { GoogleGenerativeAI } = require('@google/generative-ai');

const parseOrderWithAI = async (orderDescription) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  GEMINI_API_KEY not set on server — AI parsing disabled. Set it in Render environment variables.');
    return orderDescription; // Return raw text so at least it's honest
  }

  try {
    console.log('🤖 Calling Gemini to parse order...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an AI assistant for a small business order management system in India. A customer sent this message to place an order:

"${orderDescription}"

Your job:
1. Understand what the customer wants to order (items, quantities, sizes, colours, etc.)
2. Note any special requests (delivery time, quality reference, urgency)
3. Write a clean, structured order summary for the shop owner

Rules:
- Write in English even if the input is in Hindi/Hinglish
- Be concise — 1 to 3 lines max
- DO NOT repeat the original message word for word
- DO NOT add any explanation or preamble
- Just output the clean order summary directly

Example input: "bhai 2 kilo laal cotton chahiye same as last time aur jaldi bhejo"
Example output: "2 kg red cotton fabric. Same quality as previous order. Urgent delivery required."`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    console.log('✅ Gemini parsed successfully:', text);
    return text || orderDescription;

  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    return orderDescription;
  }
};

const mockAIService = parseOrderWithAI;

const mockPaymentService = () => {
  return new Promise((resolve) => {
    const mockId = Math.random().toString(36).substring(2, 10);
    resolve(`https://rzp.io/mocklink${mockId}`);
  });
};

module.exports = { mockAIService, mockPaymentService, parseOrderWithAI };
