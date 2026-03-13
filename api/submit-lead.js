export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/24672591/uxx1avp/";

  try {
    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
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
