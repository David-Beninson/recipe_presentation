import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Chef Structured Prompts & Persona
  app.post("/api/chef", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "Missing API Key",
          message: "Gemini API key is not configured in the Secrets panel yet, so simulating response! Add it to run live API calls.",
          simulation: true
        });
      }

      // Initialize the SDK with named parameter
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { prompt, systemInstruction, formatJson, persona } = req.body;

      // Base configuration
      const config: any = {
        temperature: 0.8,
      };

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      if (formatJson) {
        config.responseMimeType = "application/json";
        config.responseSchema = {
          type: Type.OBJECT,
          required: ["recipeName", "estimatedTime", "difficulty", "ingredients", "instructions", "chefComment"],
          properties: {
            recipeName: { type: Type.STRING, description: "The creative name of the dish" },
            estimatedTime: { type: Type.STRING, description: "Cooking and prep time (e.g. 45 min)" },
            difficulty: { type: Type.STRING, description: "Easy, Medium or Hard" },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of ingredients with measurements"
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step preparation steps"
            },
            chefComment: { type: Type.STRING, description: "A message written in the chef's exact persona/tone" }
          }
        };
      }

      // Call Gemini 3.5 Flash by default - perfectly optimized for general text & structured JSON tasks!
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt || "Give me a creative dish using random leftovers.",
        config: config
      });

      const text = response.text || "";
      res.json({
        success: true,
        text: text,
        simulation: false,
        persona: persona || "Default"
      });

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: "AI Generation Failed",
        message: error.message || "An unexpected error occurred"
      });
    }
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
