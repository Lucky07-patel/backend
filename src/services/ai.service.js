const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const cleanJson = (text) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

const qualifyLead = async (lead) => {
  const prompt = `
You are a sales qualification assistant.

Lead Details:
Name: ${lead.fullName}
Email: ${lead.email}
Business: ${lead.businessName}
Message: ${lead.message}

Tasks:
1. Score the lead as exactly one of: Hot, Warm, Cold
2. Give one-line reason
3. Generate a personalized first-response email draft addressed to the lead

Return ONLY valid JSON:
{
  "score": "Hot",
  "reason": "One-line reason here",
  "emailDraft": "Email draft here"
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