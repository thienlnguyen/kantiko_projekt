const express = require("express");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 8080;

let file = "";

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
    const chatHistory = JSON.stringify(req.body.chatHistory);
    let content = "";

    if(req.body.file){
      file = JSON.stringify(req.body.file);
     
      content =
        "Kannst du mir ein kleinen Bericht über folgende Daten bereitstellen und den Text im HTML-Stil formatieren, so dass die Tags <strong> und <br> sichtbar sind. Bitte gebe nur den Bericht aus. " +
        file;
    } else if (chatHistory === null) {
      content = nachricht;
    } else {
      content =
        "Bitte beantworte mir folgende Frage '" +
        nachricht +
        "', beachte dabei den folgenden Chatverlauf: " +
        chatHistory+
        "' und folgende Daten: " +
        file +
        "Schreibe bitte den Text im HTML-Stil, so dass die Tags <strong> und <br> sichtbar sind. Bitte gebe nur deine Antwort aus.";
        console.log("hi")
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
      model: "gpt-4-turbo-preview",
    });

    // Die generierte Antwort an das Frontend zurücksenden
    console.log({ response: completion.choices[0] }.response.message.content)
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
