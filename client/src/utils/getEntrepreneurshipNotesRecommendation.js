// utils/getEntrepreneurshipNotesRecommendation.js
import { notesEntrepreneurship6to8 } from "@/data/notesEntrepreneurship";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

export const getEntrepreneurshipNotesRecommendation = async (userMistakes) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an educational tutor. A student just played an entrepreneurship game and made mistakes.
    Your task: Recommend the MOST relevant module(s) they should revisit.

    Here are the modules:
    ${notesEntrepreneurship6to8
      .map((n) => `${n.topicId}: ${n.title}\n${n.content}`)
      .join("\n\n")}

    Student's mistakes summary:
    ${JSON.stringify(userMistakes, null, 2)}

    ❗ INSTRUCTIONS ❗
    - Carefully match the mistakes with the modules' explanations.
    - Recommend ONLY 1–2 topicIds that will help the student improve.
    - Output STRICTLY in raw JSON array format. Examples: ["3"] or ["2", "5"]
    `;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    console.log("Gemini raw output:", raw); // debug log

    // Extract JSON safely (even if Gemini adds text)
    const match = raw.match(/\[.*\]/s);
    let ids = [];
    if (match) {
      ids = JSON.parse(match[0]);
    }

    // Map IDs back to full note objects
    return notesEntrepreneurship6to8.filter((n) => ids.includes(n.topicId));
  } catch (err) {
    console.error("Gemini recommendation error:", err);
    return [notesEntrepreneurship6to8[0]]; // fallback: Entrepreneurship basics
  }
};
