const { GoogleGenerativeAI } = require("@google/generative-ai");
async function run() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`);
  const data = await res.json();
  console.log(data.models.map(m => m.name).join("\n"));
}
run();
