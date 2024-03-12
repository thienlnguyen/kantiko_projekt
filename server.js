const express = require("express");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 8080;
const assert = require('assert');
const { getEncoding, encodingForModel } = require("js-tiktoken");


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

let file = "";

require("dotenv/config");


//MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());

// OpenAI-API wird initialisiert
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST-API 
app.post("/api/createResponse", async (req, res) => {
  try {

    const message = req.body.message;
    const chatHistory = JSON.stringify(req.body.chatHistory);
    let content = "";
    

    if(req.body.file){
      file = JSON.stringify(req.body.file);
      content =
        "Kannst du mir ein kleinen Bericht über folgende Daten bereitstellen und den Text "
        +"im HTML-Stil formatieren, so dass die Tags <strong> und <br> sichtbar sind. "
        +"Bitte gebe nur den Bericht aus. " +
        file;
    } else {
      content =
        "Bitte beantworte mir folgende Frage '" +
        message +
        "', beachte dabei den folgenden Chatverlauf: " +
        chatHistory+
        "' und folgende Daten: " +
        file +
        "Schreibe bitte den Text im HTML-Stil, so dass die Tags <strong> und <br> sichtbar sind. "
        +"Bitte gebe nur deine Antwort aus.";
    }

    // Anzahl der Token der Anfrage wird berechnet
    const enc = getEncoding("gpt2");
    console.log("Anzahl der Token: " + (enc.encode(content).length));

    // OpenAI-Chat-Modell verwenden, um eine Antwort zu generieren
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Finanzassistent, der sich gut damit auskennt, Tabellen zu evaluieren und"
            + " Berichte professionell zu schreiben.",
        },
        {
          role: "user",
          content: content,
        },
      ],
      model: "gpt-4-turbo-preview",
    });

    // Die generierte Antwort an das Frontend zurücksenden
    //console.log({ response: completion.choices[0] }.response.message.content)
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
