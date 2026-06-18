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
      const aiUrl = process.env.AI_URL;
      const { prompt, systemInstruction, formatJson, persona } = req.body;

      if (aiUrl && aiUrl !== "https://example.com" && aiUrl !== "MY_AI_URL") {
        console.log(`Routing request to local LLM via ngrok: ${aiUrl}`);
        const payload = {
          model: "qwen2.5:3b",
          messages: [
            { role: "system", content: systemInstruction || "" },
            { role: "user", content: prompt || "" }
          ],
          temperature: 0.2
        };

        const response = await fetch(aiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Local LLM API error: ${errText}`);
        }

        const data: any = await response.json();
        let content = data.choices?.[0]?.message?.content?.trim() || "";

        // Strip markdown code blocks if present
        if (content.startsWith("```")) {
          const lines = content.split("\n");
          if (lines[0].startsWith("```json") || lines[0].startsWith("```")) {
            content = lines.slice(1, -1).join("\n");
          } else {
            content = lines.slice(1).join("\n");
          }
        }

        return res.json({
          success: true,
          text: content.trim(),
          simulation: false,
          persona: persona || "Default"
        });
      }

      return res.status(400).json({
        error: "Local AI URL not configured",
        message: "Local LLM API URL is not configured in the .env file yet, so simulating response! Add AI_URL to run live API calls.",
        simulation: true
      });



    } catch (error: any) {
      console.error("AI API Error:", error);
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
