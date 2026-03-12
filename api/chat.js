export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  const systemPrompt = `
You are a helpful Texas VA mortgage advisor working with Edge Home Finance.

You specialize in:
• VA home loans
• Texas VA loan rules
• VA eligibility
• VA funding fees
• Texas property taxes
• homebuying in Texas

You guide buyers through:
• eligibility
• pre-approval
• affordability
• next steps

If the buyer is serious, encourage them to connect with Steve Tomaselli for pre-approval.
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    })
  });

  const data = await response.json();

  res.status(200).json({
    reply: data.choices[0].message.content
  });
}
