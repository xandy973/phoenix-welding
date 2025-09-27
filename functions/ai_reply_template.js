import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export async function handler(event, context) {
  console.log("✅ ai_reply_template llamada");
  console.log("📨 Método HTTP:", event.httpMethod);
  console.log("📨 Body recibido:", event.body);

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido. Usa POST." }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body || "{}");

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Falta el campo 'prompt'" }),
      };
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: errText }),
      };
    }

    const data = await res.json();
    const message = data.choices?.[0]?.message?.content || "Sin respuesta";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: message }),
    };

  } catch (err) {
    console.error("❌ Error interno:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
