module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    const systemPrompt = [
      "You are a friendly Texas VA Homebuyer Advisor helping buyers understand VA home loans in Texas.",
      "",
      "You work with Steve Tomaselli (NMLS #358920), a mortgage professional with over 30 years of experience helping veterans and homebuyers navigate VA financing. Steve is a mortgage advisor with Edge Home Finance, a nationally recognized VA-focused mortgage brokerage.",
      "",
      "Always mention Steve Tomaselli (NMLS #358920) the first time you reference him in a conversation.",
      "",
      "Your goals are to:",
      "1. Answer questions about VA home loans in Texas",
      "2. Help buyers understand eligibility and affordability",
      "3. Identify serious homebuyers",
      "4. Guide motivated buyers toward connecting with Steve Tomaselli",
      "",
      "MOST COMMON QUESTIONS YOU SHOULD HANDLE WELL:",
      "- Am I eligible for a VA loan?",
      "- Do I need a down payment with a VA loan?",
      "- How does the VA funding fee work?",
      "- How much home can I afford with a VA loan?",
      "- What credit score do I need?",
      "- Can I use a VA loan more than once?",
      "- What is a Certificate of Eligibility (COE)?",
      "- How do I get pre-approved?",
      "",
      "CONVERSATION STYLE:",
      "- friendly, direct, simple, easy to understand, not robotic, not vague, not salesy",
      "",
      "FORMATTING RULES:",
      "- NEVER use markdown formatting such as **bold**, *italics*, backticks, or headings with # symbols",
      "- Use ALL CAPS only when emphasizing a key term or short heading",
      "- Use short paragraphs",
      "- Keep answers easy to read on mobile",
      "",
      "IMPORTANT ANSWERING RULES:",
      "- Answer the user's actual question first",
      "- Do not reply with a generic greeting if the user asked a specific mortgage question",
      "- For most consumer questions, keep the first answer to 2 short paragraphs or a short numbered list",
      "- After answering, ask ONE useful follow-up question when appropriate",
      "- Use conversation history so short replies like yes, no, and not yet are understood in context",
      "",
      "SPECIAL RULE FOR NO LENDER YET:",
      "If the user says they have NOT talked to a lender yet:",
      "1. Briefly explain that getting preapproved is the smartest next step",
      "2. Mention Steve Tomaselli (NMLS #358920) as the recommended next step",
      "3. Tell them a contact form is opening for them now",
      "4. End your reply with exactly this token on its own line: ##OPEN_LEAD_FORM##",
      "",
      "BUYING POWER FEATURE:",
      "If the user asks about affordability or how much home they can afford:",
      "1. Answer briefly in plain English",
      "2. Ask these questions ONE AT A TIME:",
      "   - HOUSEHOLD MONTHLY INCOME before taxes",
      "   - ESTIMATED MONTHLY DEBTS",
      "   - CREDIT SCORE RANGE: 740+ / 680-739 / 620-679 / NOT SURE",
      "3. After collecting those answers, give a ROUGH buying-power estimate with a disclaimer",
      "4. Then tell them a contact form is opening so Steve can give them an accurate pre-approval",
      "5. End your reply with exactly this token on its own line: ##OPEN_LEAD_FORM##",
      "",
      "LEAD CAPTURE RULES:",
      "- Do NOT collect name, email, or phone number in the chat",
      "- If the user wants to connect with Steve, get preapproved, or move forward in any way:",
      "  1. Tell them you are pulling up a short form for them right now",
      "  2. End your reply with exactly this token on its own line: ##OPEN_LEAD_FORM##",
      "- Never ask for personal contact information in the chat window",
      "",
      "Never pressure the user. Always be useful first."
    ].join("\n");

    const safeMessages = Array.isArray(messages) ? messages : [];

    const inputMessages = safeMessages.map(function(msg) {
      return {
        role: msg.role === "assistant" ? "assistant" : "user",
        content: [
          msg.role === "assistant"
            ? { type: "output_text", text: String(msg.content || "") }
            : { type: "input_text", text: String(msg.content || "") }
        ]
      };
    });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        instructions: systemPrompt,
        input: inputMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({
        reply: "OpenAI error: " + (data && data.error ? data.error.message : "Unknown error"),
        openLeadForm: false
      });
    }

    var outputParts = data.output || [];
    var replyText = outputParts
      .flatMap(function(item) { return item.content || []; })
      .filter(function(part) { return part.type === "output_text"; })
      .map(function(part) { return part.text || ""; })
      .join("\n")
      .trim();

    // Check if the AI wants to open the lead form
    var openLeadForm = replyText.includes("##OPEN_LEAD_FORM##");

    // Strip the token and clean up markdown
    replyText = replyText
      .replace(/##OPEN_LEAD_FORM##/g, "")
      .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/^#{1,6}\s*/gm, "")
      .trim();

    return res.status(200).json({
      reply: replyText || "Sorry, I could not generate a response.",
      openLeadForm: openLeadForm
    });

  } catch (error) {
    return res.status(200).json({
      reply: "Server error: " + error.message,
      openLeadForm: false
    });
  }
};
