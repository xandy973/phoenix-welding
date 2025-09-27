// functions/ai-reply-template.js
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    // Verificar método
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Método no permitido, usa POST." }),
      };
    }

    // Parsear body enviado desde el frontend
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message || "Hola, dame una respuesta de prueba";

    // Llamada a Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en Gemini API: ${response.statusText}`);
    }

    const data = await response.json();
    const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: aiReply }),
    };
  } catch (error) {
    console.error("Error en función:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
