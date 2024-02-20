<template>
  <q-page class="flex flex-center">
    <div q-pa-md>
      <div v-show="!fileAttached">
        <input type="file" @change="handleFileUpload" />
        <q-btn label="upload" outlined @click="sendFile"> </q-btn>
      </div>

      <div v-show="fileAttached">
        <!-- Chatfenster -->
        <div class="chat-window" ref="chatWindow">
          <div
            v-for="(message, index) in chatHistory"
            :key="index"
            class="message"
          >
            <span v-if="message.role === 'user'" class="user-message">{{
              message.content
            }}</span>
            <span v-else class="assistant-message">{{ message.content }}</span>
          </div>
        </div>

        <!-- Eingabebereich -->
        <q-input v-model="text" label="Nachricht" @keyup.enter="senden" />

        <!-- Senden-Button -->
        <q-btn color="red" icon-right="send" label="Senden" @click="senden" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { api } from "boot/axios";
import { excelToJson } from "src/excelToJSON.js";

export default {
  data() {
    return {
      text: "",
      chatHistory: [], // Array zum Speichern der Chatverlaufsnachrichten
      fileAttached: false,
      file: null,
      jsonData: null,
    };
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      try {
        const jsonData = await excelToJson(file);
        this.jsonData = jsonData;
        console.log(jsonData);
      } catch (error) {
        console.error("Fehler beim Lesen der Datei:", error);
      }
    },
    async sendFile() {
      console.log(this.jsonData);
      try {
        // Senden Sie die aktuelle Nachricht zusammen mit der Chat-History an den Server
        const response = await api.post("/api/text", {
          file: this.jsonData,
        });

        // Antwort des Servers zum Chatverlauf hinzufügen
        this.chatHistory.push({ role: "user", content: "Datei hochgeladen" });
        this.chatHistory.push({ role: "assistant", content: response.data });
        // Scrollen Sie zum unteren Rand des Chatfensters, um die neueste Nachricht anzuzeigen
        this.$refs.chatWindow.scrollTop = this.$refs.chatWindow.scrollHeight;
        // Zurücksetzen des File Uploads
        this.file = null;
        this.fileAttached = true;
      } catch (error) {
        console.error("Fehler beim Senden der Nachricht:", error);
      }
    },
    async senden() {
      try {
        // Senden Sie die aktuelle Nachricht zusammen mit der Chat-History an den Server
        const response = await api.post("/api/text", {
          nachricht: this.text,
          chatHistory: this.chatHistory,
        });
        // Antwort des Servers zum Chatverlauf hinzufügen
        this.chatHistory.push({ role: "user", content: this.text });
        this.chatHistory.push({ role: "assistant", content: response.data });
        // Scrollen Sie zum unteren Rand des Chatfensters, um die neueste Nachricht anzuzeigen
        this.$refs.chatWindow.scrollTop = this.$refs.chatWindow.scrollHeight;
        // Zurücksetzen des Textfelds
        this.text = "";
      } catch (error) {
        console.error("Fehler beim Senden der Nachricht:", error);
      }
    },
  },
};
</script>

<style>
.chat-window {
  height: 300px;
  overflow-y: scroll;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 5px;
}

.user-message {
  display: block;
  background-color: #a5c4e2;
  padding: 5px 10px;
  border-radius: 10px;
}

.assistant-message {
  display: block;
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 10px;
}
</style>
