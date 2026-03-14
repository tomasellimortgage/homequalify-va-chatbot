export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/24672591/uxx1avp/";

  try {
    // Safely parse body whether it arrives as a string or object
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }

    // Guard: reject if all key fields are empty
    const { first_name, last_name, email, mobile_phone } = body || {};
    if (!first_name && !last_name && !email && !mobile_phone) {
      return res.status(400).json({ error: "Empty submission rejected" });
    }

    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const text = await response.text();
      console.error("Zapier error:", response.status, text);
      return res.status(500).json({ error: "Zapier webhook failed" });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
