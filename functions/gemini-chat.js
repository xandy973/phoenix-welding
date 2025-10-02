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
  model: "gemini-1.5-flash", // modelo rápido, eficiente y gratuito en cuota
  systemInstruction: `Eres "Fénix", el asistente virtual de Phoenix Welding, una empresa experta en soldadura con más de 10 años de experiencia en Neuquén, Neuquén, Argentina. 
  Tu misión es ayudar a clientes industriales y particulares con información clara, útil y amable, siempre en español.

  REGLAS ESENCIALES:
  - Responde SIEMPRE en español, con un tono profesional pero cercano.
  - Sé breve: máximo 2–3 oraciones por respuesta.
  - Nunca inventes precios, tiempos de entrega ni especificaciones técnicas que no conozcas.
  - Siempre redirige a WhatsApp para presupuestos o detalles personalizados.
  - Menciona servicios clave: soldadura TIG, MIG, por electrodo, estructuras metálicas, rejas, portones y reparaciones a medida.
  - Horario de atención: Lunes a viernes de 8:00 a 18:00 hrs.
  - Ubicación: Neuquén, Neuquén, Argentina.
  - WhatsApp oficial: +54 299 5516209 (¡incluye este número en respuestas relevantes!).
  - Si te preguntan por garantías: "Todos nuestros trabajos incluyen garantía por escrito."
  - Si no sabes algo, di: "Prefiero darte información precisa. Escríbenos por WhatsApp al +54 299 5516209 y te atendemos al instante."

  Ejemplos de respuestas ideales:
  - "¿Hacen soldadura de aluminio?" → "Sí, trabajamos aluminio con soldadura TIG. Para un presupuesto sin compromiso, escríbenos por WhatsApp al +54 299 5516209."
  - "¿Cuánto cuesta una reja?" → "El precio depende del diseño, material y tamaño. Te enviamos una cotización personalizada por WhatsApp al +54 299 5516209."
  - "¿Dónde están ubicados?" → "Estamos en Neuquén, Argentina. Atendemos de lunes a viernes, 8:00 a 18:00 hrs. ¿Te enviamos la dirección exacta por WhatsApp?"
  `
});

exports.handler = async (event, context) => {
  // Permitir solicitudes desde tu dominio (CORS)
  const headers = {
    "Access-Control-Allow-Origin": "*",
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

    // Mensaje amable de respaldo
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Lo siento, tuve un problema técnico. Por favor, contáctanos directamente por WhatsApp al +54 299 505-4125. ¡Te esperamos!"
      })
    };
  }
};