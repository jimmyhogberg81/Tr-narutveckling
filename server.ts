import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set high limit for base64 audio string uploads
app.use(express.json({ limit: "50mb" }));

// Initialize the GoogleGenAI instance server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Endpoint to transcribe speech and extract clean structural bullet points in Swedish
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audio, mimeType } = req.body;

    if (!audio) {
      return res.status(400).json({ error: "Missing audio data in request." });
    }

    if (!ai) {
      return res.status(500).json({
        error: "Gemini API-nyckel saknas. Var god konfigurera den i Secrets-panelen."
      });
    }

    // Use gemini-3.5-flash which has native multi-modal audio transcription capability
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: audio,
            mimeType: mimeType || "audio/webm",
          },
        },
        {
          text: `Analysera denna muntliga observation som talats in av en fotbollscoach-utvecklare under en pågående elitfotbollsträning.
          Transkribera ljudet och dela upp det i en eller flera korta, konkreta, fotbollstaktiska eller pedagogiska observationer i punktform på svenska.
          
          Regler:
          1. Ta bort onödiga utfyllnadsord (t.ex. "liksom", "eh", "typ").
          2. Rensa babbel men bevara alla faktiska fotbollsfackord, taktiska poänger, observationer om spelarbeteende, tränarplacering eller röstläge.
          3. Svara strikt i JSON-format med fältet "points" som innehåller en sträng-array med dina korta och tydliga punkter. Du får absolut inte ge någon förklarande text utanför denna JSON.
          4. Låt varje punkt vara källtrogen men omformulerad för maximal professionell tydlighet.`
        }
      ],
      config: {
        systemInstruction: "Du är en expertassistent för tränarutveckling i elitfotboll. Ditt jobb är att strukturera muntliga tankar från en coachutvecklare till professionella observationspunkter i punktform på svenska.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array av färdigformulerade fotbollsobservationer på svenska."
            }
          },
          required: ["points"]
        }
      }
    });

    const responseText = response.text ? response.text.trim() : "{\"points\":[]}";
    const structuredResult = JSON.parse(responseText);
    res.json(structuredResult);
  } catch (err: any) {
    console.error("Transcription pipeline error:", err);
    res.status(500).json({ error: err.message || "Ett systemfel uppstod vid transkribering av röstmeddelandet." });
  }
});

// Serve frontend assets or integrate Vite Middleware depending on node environment
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite Dev Server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode serving bundled static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Elite Coach Tracker] Server active on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
