// functions/gemini-chat.js
// Esta función se ejecuta en el servidor de Netlify (seguro)

const { GoogleGenerativeAI } = require("@google/generative-ai");

// La clave API se guarda en una variable de entorno (Netlify → Site settings → Environment variables)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ Falta la variable de entorno GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Configuración del modelo
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // modelo rápido y gratis
  systemInstruction: `Eres un asistente amable de Phoenix Welding, una empresa chilena de soldadura industrial y para particulares. 
  Responde SIEMPRE en español, de forma clara, breve y profesional. 
  Si te preguntan precios, di que varían según el material y complejidad, y que deben contactar por WhatsApp para un presupuesto sin compromiso.
  Si te preguntan por ubicación, di que están en Maipú, Santiago.
  Si no sabes algo, redirige amablemente a WhatsApp o al formulario de contacto.`
});

exports.handler = async (event, context) => {
  // Permitir solicitudes desde tu dominio (CORS)
  const headers = {
    "Access-Control-Allow-Origin": "*", // o tu dominio: "https://tusitio.netlify.app"
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Manejar preflight (solicitud OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  // Solo aceptar POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método no permitido" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Mensaje vacío" })
      };
    }

    // Llamar a Gemini
    const chat = model.startChat();
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const botReply = response.text().trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: botReply })
    };

  } catch (error) {
    console.error("Error en Gemini:", error);

    // No exponer detalles del error al frontend
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Lo siento, no pude responder. ¿Podrías contactarnos por WhatsApp?"
      })
    };
  }
};