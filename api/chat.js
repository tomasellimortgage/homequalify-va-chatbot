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
        instructions: systemPrompt,
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({
        reply: `OpenAI error: ${data?.error?.message || "Unknown error"}`
      });
    }

    const reply = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text || "")
      .join("\n")
      .trim();

    return res.status(200).json({
      reply: reply || "Sorry, I couldn't generate a response."
    });
  } catch (error) {
    return res.status(200).json({
      reply: `Server error: ${error.message}`
    });
  }
};