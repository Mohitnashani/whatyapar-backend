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

1. "summary" — A clean 1-3 line professional order summary in English for the shop owner.

2. "items" — An array of objects. Each object must have:
   - "name": normalized English item name (lowercase, SINGULAR form, CORRECT standard spelling — see rules below)
   - "quantity": numeric quantity (default 1 if not mentioned)
   - "unit": unit string like "kg", "g", "litre", "ml", "piece", "dozen", "box", "packet", "meter", "roll", "bottle", "strip", "tablet" — empty string if no unit

CRITICAL SPELLING RULES — always use the correct standard spelling:
- paracetomol / paracetomole / paracetamole / paracetamal → "paracetamol"
- crocine / krocin / krosin / crocin → "crocin"
- bannana / bananaa / bananna → "banana"
- biscut / biskit / biscit → "biscuit"
- toothpast / toothpase / tothpaste → "toothpaste"
- Always use SINGULAR: bananas→banana, tablets→tablet, bottles→bottle, eggs→egg

HINDI/HINGLISH TO ENGLISH:
- "aata" / "atta" → "wheat flour"
- "chawal" / "chaawal" → "rice"
- "doodh" / "dudh" → "milk"
- "tel" → "oil", "sarson tel" → "mustard oil"
- "cheeni" / "chini" → "sugar"
- "namak" / "noon" → "salt"
- "sabun" → "soap"
- "makhan" → "butter"
- "chai patti" → "tea leaves"
- "ande" / "anda" → "egg"
- "laal" → "red", "kala" → "black", "safed" → "white"
- Number words: "ek"→1, "do"→2, "teen"→3, "char"→4, "paanch"→5, "das"→10

QUANTITY RULES:
- Extract actual numeric quantity ("5 kg aata" → quantity:5, unit:"kg")
- "do kilo" → quantity:2, unit:"kg"
- "ek dozen" → quantity:1, unit:"dozen"
- No duplicates in items array

Example input: "bhai 5 kilo aata aur 2 litre tel dena, ek dozen ande aur paracetomol 10 tablet"
Example output:
{
  "summary": "5 kg wheat flour, 2 litres mustard oil, 1 dozen eggs, and 10 tablets of paracetamol.",
  "items": [
    { "name": "wheat flour", "quantity": 5, "unit": "kg" },
    { "name": "oil", "quantity": 2, "unit": "litre" },
    { "name": "egg", "quantity": 1, "unit": "dozen" },
    { "name": "paracetamol", "quantity": 10, "unit": "tablet" }
  ]
}

Respond ONLY with valid JSON. No extra text outside the JSON.`
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
