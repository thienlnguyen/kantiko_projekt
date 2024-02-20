const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const fs = require("fs");
const app = express();
const path = require("path");
const port = 8080;

const uploadDir = path.join(__dirname, "/uploads");

// Initialisieren Sie die OpenAI-API
const openai = new OpenAI({
  apiKey: "IHR_OPENAI_API_SCHLÜSSEL",
});

app.use(bodyParser.json());

// Endpunkt zum Speichern der hochgeladenen Datei
app.post("/upload", (req, res) => {
  try {
    // Datei aus dem Request extrahieren
    const file = req.body.file;
    // Dateiname und Pfad angeben, wo die Datei gespeichert werden soll
    const fileName = path.join(uploadDir, file.name);
    // Datei im angegebenen Pfad speichern
    fs.writeFileSync(fileName, file.data, "binary");
    console.log("Datei erfolgreich gespeichert:", fileName);
    // Erfolgsmeldung an den Client senden
    res.status(200).json({ message: "Datei erfolgreich gespeichert." });
  } catch (error) {
    console.error("Fehler beim Speichern der Datei:", error);
    // Fehlermeldung an den Client senden
    res.status(500).json({ error: "Fehler beim Speichern der Datei." });
  }
});

// Endpunkt für die Chat-Bot-Funktion
app.post("/api/chat", async (req, res) => {
  try {
    // Nachrichten vom Frontend abrufen
    const messages = req.body.messages;

    // OpenAI-Chat-Modell verwenden, um eine Antwort zu generieren
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
    });

    // Die generierte Antwort an das Frontend zurücksenden
    res.json({ response: completion.choices[0] });
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
