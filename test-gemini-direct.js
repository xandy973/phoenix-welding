// test-gemini-direct.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const endpoint = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateMessage";

async function testDirect() {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GEMINI_KEY}`
      },
      body: JSON.stringify({
        input: "Escribime un chiste corto de programadores 😁"
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const data = await res.json();
    console.log("✅ Respuesta directa de Gemini:", data);
  } catch (err) {
    console.error("❌ Error directo a Gemini:", err.message);
  }
}

testDirect();
