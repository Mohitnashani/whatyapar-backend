const { GoogleGenerativeAI } = require('@google/generative-ai');

// Fallback mock parser in case Gemini API key is not set or call fails
const mockParse = (orderDescription) => {
  const items = orderDescription
    .split(/,|\n/)
    .map(item => item.trim())
    .filter(item => item.length > 1);
  return items.length > 0 ? items.join(', ') : orderDescription;
};

const parseOrderWithAI = async (orderDescription) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fall back to mock if no API key configured
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set — using mock parser');
    return mockParse(orderDescription);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an order parser for a small business. A customer has sent the following order message on WhatsApp:

"${orderDescription}"

Extract and summarize this order in a clear, professional format. Include:
- What items they want (with quantities if mentioned)
- Any special instructions or notes
- Any references to previous orders if mentioned

Reply ONLY with the clean order summary in 1-3 short lines. No extra explanation. No JSON. Just plain text that the shop owner can read at a glance.

Example output:
"2 kg red cotton fabric, 1 roll black thread. Same quality as last week. Urgent delivery needed."`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text || mockParse(orderDescription);

  } catch (error) {
    console.error('Gemini API error:', error.message);
    // Gracefully fall back to mock parser
    return mockParse(orderDescription);
  }
};

// Keep the old mock exports for backward compatibility
const mockAIService = parseOrderWithAI;
const mockPaymentService = () => {
  return new Promise((resolve) => {
    const mockId = Math.random().toString(36).substring(2, 10);
    resolve(`https://rzp.io/mocklink${mockId}`);
  });
};

module.exports = { mockAIService, mockPaymentService, parseOrderWithAI };
