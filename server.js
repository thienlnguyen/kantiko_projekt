const express = require("express");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const cors = require("cors");
const formidable = require("formidable");
const fs = require("fs");
const app = express();
const path = require("path");
const port = 8080;
const folder = path.join(__dirname, "files");

require("dotenv/config");

app.use(bodyParser.json());

//MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());

// Initialisieren Sie die OpenAI-API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpunkt für die Chat-Bot-Funktion
app.post("/api/text", async (req, res) => {
  try {
    const nachricht = req.body.nachricht;
    const file = JSON.stringify(req.body.file);
    const chatHistory = JSON.stringify(req.body.chatHistory);
    let content = "";

    console.log(file);
    if (file) {
      content =
        "Kannst du mir ein kleinen bericht über folgende Daten bereitstellen: " +
        file;
    } else if (chatHistory === null) {
      content = nachricht;
    } else {
      content =
        "Bitte beantworte mir folgende Frage '" +
        nachricht +
        "' und beachte dabei den folgenden Chatverlauf: " +
        chatHistory;
    }
    // OpenAI-Chat-Modell verwenden, um eine Antwort zu generieren
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Finanzassistent, der sich gut damit auskennt, Tabellen zu evaluieren und Berichte zu schreiben.",
        },
        {
          role: "user",
          content: content,
        },
      ],
      model: "gpt-4-0125-preview",
    });

    // Die generierte Antwort an das Frontend zurücksenden
    res.json({ response: completion.choices[0] }.response.message.content);
  } catch (error) {
    console.error("Fehler beim Chat mit OpenAI:", error);
    res
      .status(500)
      .json({ error: "Ein interner Serverfehler ist aufgetreten." });
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
