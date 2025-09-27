import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const NETLIFY_FUNCTION_URL = process.env.NETLIFY_URL || "http://localhost:8888/.netlify/functions/ai_reply_template";
const prompt = "Escribime un chiste corto de programadores 😁";

async function testFunction() {
  try {
    const response = await fetch(NETLIFY_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` // si tu función necesita clave
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Respuesta de la función:", data);
  } catch (error) {
    console.error("❌ Error al llamar la función:", error.message);
  }
}

testFunction();
