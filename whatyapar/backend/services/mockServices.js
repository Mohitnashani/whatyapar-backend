const Groq = require('groq-sdk');

const mockParse = (orderDescription) => {
  const parts = orderDescription.split(/,|\n/).map(i => i.trim()).filter(i => i.length > 1);
  return {
    summary: orderDescription,
    items: parts.map(p => ({ name: p, quantity: 1, unit: '' })),
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
          content: `You are an order parser for a small Indian business. Messages may be in English, Hindi, or Hinglish.

Return a JSON object with exactly two fields:

1. "summary" — A clean 1–3 line professional order summary in English for the shop owner.

2. "items" — An array of objects. Each object must have:
   - "name": normalized English item name (lowercase, no quantities, no adjectives except type/color if important)
   - "quantity": numeric quantity (default 1 if not mentioned)
   - "unit": unit string like "kg", "g", "litre", "ml", "piece", "dozen", "box", "packet", "meter", "roll", "bottle", "strip" — empty string if no unit

IMPORTANT normalization rules:
- Always use English names even if order is in Hindi/Hinglish
- Treat same item across languages as ONE:
  "aata" → "wheat flour", "chawal" → "rice", "doodh" → "milk",
  "tel" → "oil", "cheeni" → "sugar", "namak" → "salt",
  "sabun" → "soap", "makhan" → "butter", "chai patti" → "tea leaves",
  "laal cotton" → "red cotton", "kala thread" → "black thread"
- Extract the actual numeric quantity (e.g. "5 kg aata" → quantity: 5, unit: "kg")
- If someone says "do kilo" → quantity: 2, unit: "kg"
- If no quantity mentioned → quantity: 1, unit: ""
- No duplicates in items array

Example input: "bhai 5 kilo aata aur 2 litre tel dena, aur ek dozen ande"
Example output:
{
  "summary": "5 kg wheat flour, 2 litre oil, and 1 dozen eggs.",
  "items": [
    { "name": "wheat flour", "quantity": 5, "unit": "kg" },
    { "name": "oil", "quantity": 2, "unit": "litre" },
    { "name": "eggs", "quantity": 1, "unit": "dozen" }
  ]
}

Respond ONLY with valid JSON. No extra text.`
        },
        {
          role: 'user',
          content: `Parse this order: "${orderDescription}"`
        }
      ],
      temperature: 0.1,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    console.log('✅ Groq raw response:', raw);

    const parsed = JSON.parse(raw);
    const summary = parsed.summary || orderDescription;
    const items = Array.isArray(parsed.items)
      ? parsed.items
          .filter(i => i && i.name)
          .map(i => ({
            name: String(i.name).toLowerCase().trim(),
            quantity: Number(i.quantity) || 1,
            unit: String(i.unit || '').toLowerCase().trim(),
          }))
      : [];

    return { summary, items };

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
