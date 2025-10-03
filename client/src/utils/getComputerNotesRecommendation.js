// utils/getComputerNotesRecommendation.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { notesComputer6to8 } from "@/data/notesComputer6to8";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

export const getComputerNotesRecommendation = async (userMistakes) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    You are an educational tutor. A student just played a Computer (AI) game and made mistakes.
    Your task: Recommend the MOST relevant module(s) they should revisit.

    Here are the modules:
    ${notesComputer6to8
      .map((n) => `${n.topicId}: ${n.title}\n${n.content}`)
      .join("\n\n")}

    Student's mistakes summary:
    ${JSON.stringify(userMistakes, null, 2)}

    ❗ INSTRUCTIONS ❗
    - Recommend ONLY 1–2 topicIds.
    - Output STRICTLY in raw JSON array format. Example: ["2"] or ["3", "4"]
    `;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    console.log("Gemini raw output (Computer):", raw); // 🔍 Debug

    // Extract JSON safely
    const match = raw.match(/\[(.*?)\]/s);
    if (!match) throw new Error("No JSON array found");

    let ids = JSON.parse(match[0]);

    // Extra safety: force string IDs
    ids = ids.map((id) => String(id));

    return notesComputer6to8.filter((n) => ids.includes(n.topicId));
  } catch (err) {
    console.error("Gemini Computer recommendation error:", err.message);
    return []; // empty → no recommendation
  }
};
