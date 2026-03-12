module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const systemPrompt = `
You are a helpful Texas VA mortgage advisor working with Edge Home Finance.

You specialize in:
- VA home loans
- Texas VA loan rules
- VA eligibility
- VA funding fees
- Texas property taxes
- homebuying in Texas

Guide buyers through eligibility, affordability, and next steps.
If they seem serious, suggest they connect with Steve Tomaselli for pre-approval.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    const reply =
      data.output_text ||
      "Sorry, I couldn't generate a response.";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(200).json({
      reply: `Server error: ${error.message}`
    });
  }
};