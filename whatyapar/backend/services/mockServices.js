const Groq = require('groq-sdk');

// Simple mock fallback if no AI key is configured
const mockParse = (orderDescription) => {
  return orderDescription; // return as-is honestly
};

const parseOrderWithAI = async (orderDescription) => {
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    console.warn('⚠️  GROQ_API_KEY not set — AI parsing disabled. Add it in Render environment variables.');
    return mockParse(orderDescription);
  }

  try {
    console.log('🤖 Calling Groq AI to parse order...');

    const groq = new Groq({ apiKey: groqKey });

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192', // Free, fast model on Groq
      messages: [
        {
          role: 'system',
          content: `You are an order parser for a small Indian business. 
Your job is to read a customer's order message (may be in English, Hindi, or Hinglish) and write a clean, professional order summary for the shop owner.

Rules:
- Write in English only
- Be concise: 1 to 3 lines max
- Include items, quantities, sizes, colors if mentioned
- Include any special instructions or urgency
- DO NOT repeat the message word for word — actually summarize it
- DO NOT add any preamble like "Here is the summary:" — just write the summary directly`
        },
        {
          role: 'user',
          content: `Customer order message: "${orderDescription}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    console.log('✅ Groq AI parsed successfully:', text);
    return text || mockParse(orderDescription);

  } catch (error) {
    console.error('❌ Groq AI error:', error.message);
    return mockParse(orderDescription);
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
