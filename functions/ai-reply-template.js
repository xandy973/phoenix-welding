// Template serverless function (Node) to proxy AI requests (e.g., OpenAI)
// Do NOT commit real API keys. Set API key in environment variable (e.g., AI_API_KEY) in your hosting provider.

// Example for Netlify functions (AWS Lambda-like):
// Save as functions/ai_reply.js and deploy to Netlify, then set NETLIFY env var AI_API_KEY in site settings.

const fetch = require('node-fetch'); // include in package if needed

exports.handler = async function(event, context){
  try{
    const body = JSON.parse(event.body || '{}');
    const prompt = body.prompt || '';
    if(!prompt) return { statusCode: 400, body: JSON.stringify({ error: 'No prompt' }) };

    const API_KEY = process.env.AI_API_KEY; // set this securely in hosting env
    if(!API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'AI API key not configured' }) };

    // Example OpenAI call (pseudo): adapt per provider and SDK
    const resp = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
      body: JSON.stringify({ prompt: prompt, max_tokens: 150, temperature: 0.6 })
    });
    const data = await resp.json();
    // Extract text depending on provider response shape
    var reply = data && data.choices && data.choices[0] && data.choices[0].text ? data.choices[0].text.trim() : (data && data.reply) || '';

    return { statusCode: 200, body: JSON.stringify({ reply: reply }) };
  }catch(err){
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
