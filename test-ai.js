// test-ai.js
import fetch from "node-fetch";

// ⚠️ Cambia esto por la URL real de tu sitio en Netlify
const NETLIFY_URL = "https://devserver-main--astounding-squirrel-97aa95.netlify.app";

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
