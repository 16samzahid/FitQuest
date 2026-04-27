import {
    getAI,
    getGenerativeModel,
    GoogleAIBackend,
    Schema,
} from "firebase/ai";
import { app } from "../../config/FirebaseConfig";

const ai = getAI(app, { backend: new GoogleAIBackend() });

const jsonSchema = Schema.object({
  properties: {
    description: Schema.string(),
    category: Schema.string(),
    coins: Schema.string(),
  },
});

const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: jsonSchema,
  },
});

export async function generateTaskSuggestion(child, completedTasks = []) {
  if (!child) {
    throw new Error("Child data is required for AI suggestion");
  }

  const prompt = `
Suggest one child-friendly task for a health and exercise app.

Child data:
Health: ${child?.health}
Hunger: ${child?.hunger}
Happiness: ${child?.happiness}

Recent completed tasks:
${completedTasks.map((task) => `- ${task.description}`).join("\n")}

Ensure that you give balanced task suggestions e.g. if they have been doing a lot of exercise tasks, suggest a learning or hygiene task next.

Ensure coins are either 5, 10, 15 or 20, and the category is one of: Exercise, Hygiene, Food, Water, Play or Learning. 
Make sure the task description is short, max 6-8 words.

Return only JSON:
{
  "description": "",
  "category": "",
  "coins": ""
}
`;

  try {
    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      throw new Error("No response from AI model");
    }

    let text = result.response.text();

    if (!text) {
      throw new Error("Empty response text from AI model");
    }

    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      text = jsonMatch[1];
    }

    // Extract JSON object if wrapped in extra characters
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      text = objectMatch[0];
    }

    text = text.trim();
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    if (error.message?.includes("AbortSignal")) {
      console.error("AI Service Error: AbortSignal compatibility issue", error);
      throw new Error("AI service unavailable. Please try again in a moment.");
    }
    if (error.message?.includes("JSON")) {
      console.error("AI Service Error: Invalid JSON response", error);
      throw new Error("AI service returned invalid data. Please try again.");
    }
    if (error.message?.includes("high demand")) {
      console.error("AI Service Error: Model overloaded", error);
      throw new Error("AI service is busy. Please try again in a moment.");
    }
    console.error("AI Service Error:", error);
    throw error;
  }
}
