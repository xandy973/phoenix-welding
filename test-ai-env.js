// test-ai-env.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const NETLIFY_URL = process.env.NETLIFY_URL;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function testAI() {
  try {
    const res = await fetch(NETLIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Escribime un chiste corto de programadores 😁",
      }),
    });

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();
    console.log("✅ Respuesta de la IA:", data.reply);
  } catch (err) {
    console.error("❌ Error al llamar la función:", err.message);
  }
}

testAI();
