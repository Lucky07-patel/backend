const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const cleanJson = (text) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

const qualifyLead = async (lead) => {
  const prompt = `
You are an expert sales qualification assistant.

Lead Details:
Name: ${lead.fullName}
Email: ${lead.email}
Business: ${lead.businessName}
Message: ${lead.message}

Qualification Rules:

HOT:
- Ready to buy
- Requests pricing, demo, proposal, quotation
- Has urgent requirement
- Shows strong purchase intent

WARM:
- Interested but not ready to buy immediately
- Asking for information
- Exploring solutions
- Moderate buying intent

COLD:
- General inquiry
- Very little buying intent
- No clear business requirement
- Just browsing

Tasks:
1. Analyze the lead details.
2. Assign exactly one score: Hot, Warm, or Cold.
3. Give a short reason (max 1 sentence).
4. Generate a personalized email response.

Return ONLY valid JSON:

{
  "score": "Hot",
  "reason": "Lead requested pricing and demo.",
  "emailDraft": "Dear John, ..."
}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const text = completion.choices[0].message.content;

  return JSON.parse(cleanJson(text));
};

module.exports = {
  qualifyLead,
};