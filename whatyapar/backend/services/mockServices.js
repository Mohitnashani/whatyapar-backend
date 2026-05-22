const Groq = require('groq-sdk');

const mockParse = (orderDescription) => {
  return {
    summary: orderDescription,
    items: orderDescription.split(/,|\n/).map(i => i.trim()).filter(i => i.length > 1),
  };
};

const parseOrderWithAI = async (orderDescription) => {
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    console.warn('⚠️  GROQ_API_KEY not set — AI parsing disabled.');
    return mockParse(orderDescription);
  }

  try {
    console.log('🤖 Calling Groq AI to parse order...');

    const groq = new Groq({ apiKey: groqKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an order parser for a small Indian business. The customer message may be in English, Hindi, or Hinglish.

Your task: Return a JSON object with exactly two fields:
1. "summary" — A clean 1–3 line professional order summary in English for the shop owner
2. "items" — A list of normalized English item names only (no quantities, no descriptions, just the core item name)

IMPORTANT rules for "items":
- Always use English item names (convert Hindi/Hinglish to English)
- Treat the same product in different languages as ONE item:
  Examples: "aata"→"wheat flour", "chawal"→"rice", "doodh"→"milk", "makhan"→"butter",
  "tel"→"oil", "cheeni"→"sugar", "namak"→"salt", "sabun"→"soap",
  "laal cotton"→"red cotton fabric", "kala thread"→"black thread"
- Use lowercase, simple names
- No duplicates
- If quantity is mentioned, still just put the item name (not the quantity)

Respond ONLY with valid JSON, nothing else. Example:
{
  "summary": "2 kg wheat flour and 1 litre mustard oil. Urgent delivery.",
  "items": ["wheat flour", "mustard oil"]
}`
        },
        {
          role: 'user',
          content: `Parse this order: "${orderDescription}"`
        }
      ],
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    console.log('✅ Groq raw response:', raw);

    const parsed = JSON.parse(raw);
    const summary = parsed.summary || orderDescription;
    const items = Array.isArray(parsed.items) ? parsed.items.map(i => i.toLowerCase().trim()).filter(Boolean) : [];

    return { summary, items };

  } catch (error) {
    console.error('❌ Groq AI error:', error.message);
    return mockParse(orderDescription);
  }
};

// mockAIService now returns { summary, items }
const mockAIService = parseOrderWithAI;

const mockPaymentService = () => {
  return new Promise((resolve) => {
    const mockId = Math.random().toString(36).substring(2, 10);
    resolve(`https://rzp.io/mocklink${mockId}`);
  });
};

module.exports = { mockAIService, mockPaymentService, parseOrderWithAI };
