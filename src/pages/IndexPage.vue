<template>
  <q-page>
    <div class="page">
      <div v-show="loading_upload" class="loader_upload"></div>

      <!-- File-Uploader -->
      <div q-pa-md class="upload-container" v-show="!fileAttached && !loading_upload">
        <input class="uploader" type="file" @change="handleFileUpload" />
        <br>
        <q-btn v-show="uploadBtn" color="primary" class="upload-btn" outlined @click="sendFile">Datei analysieren lassen</q-btn>
      </div>

      <!-- Chatfenster -->
      <div q-pa-md v-show="fileAttached">
        <div q-pa-md class="chat-window" ref="chatWindow">
          <div v-for="(message, index) in chatHistory" :key="index" class="message">
            <span v-if="message.role === 'user'" class="user-message">
              <strong>Du: </strong><br>
              <span v-html="message.content"></span>
            </span>
            <span v-else class="assistant-message">
              <strong>Chat-Bot: </strong><br>
              <span v-html="message.content"></span>
            </span>
          </div>
        </div>

        <!-- Eingabebereich -->
        <div class="input-container">
          <q-input standout class="text-input" v-model="message" label="Nachricht" @keyup.enter="sendQuestion" />
          <q-btn v-show="!loading_send" class="send-btn" color="primary" icon-right="send" @click="sendQuestion" />
          <div v-show="loading_send" class="loader_container">
          <div class="loader_send"></div></div>
        </div>
      </div>
      
    </div>
  </q-page>
</template>

<script>
import { api } from "boot/axios";
import { excelToJson } from "src/excelToJSON.js";

export default {
  data() {
    return {
      message: "",
      chatHistory: [],
      fileAttached: false,
      jsonData: null,
      loading_upload: false,
      loading_send: false,
      uploadBtn: false,
      fileName: "",
    };
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      this.fileName = file.name;

    //Excel-Datei in eine JSON umwandeln
      try {
        const jsonData = await excelToJson(file);
        this.jsonData = jsonData;
      } catch (error) {
        console.error("Fehler beim Lesen der Datei:", error);
      }

      this.uploadBtn = true;
    },
    async sendFile() {
      this.loading_upload = true;
      
      //JSON Datei an den Server senden für die Erstellung des Berichts
      try {
        const response = await api.post("/api/createResponse", {
          file: this.jsonData,
        });
        
        const user = "Erstelle ein Bericht für die Datei: "+this.fileName;
        this.addToHistory(user, response.data)
       
      } catch (error) {
        console.error("Fehler beim Senden der Nachricht:", error);
      }

      this.loading_upload = false;
      this.fileAttached = true;
    },
    async sendQuestion() {
      this.loading_send = true;

      // Nachricht wird an den Server gesendet
      try {
        const response = await api.post("/api/createResponse", {
          message: this.message,
          chatHistory: this.chatHistory,
        });

        this.addToHistory(this.message, response.data)

      } catch (error) {
        console.error("Fehler beim Senden der Nachricht:", error);
      }
      this.message = "";
      this.loading_send = false;
    },
    addToHistory(userContent, assistantContent){
      //Antwort der Openai-API wird in die Chat-Historie gespeichert
      this.chatHistory.push({ role: "user", content: userContent });
      this.chatHistory.push({ role: "assistant", content: assistantContent });
      this.$refs.chatWindow.scrollTop = this.$refs.chatWindow.scrollHeight;
    }
  },
};
</script>

<style>
.page{
  margin: 20px;
  display: flex;
  justify-content: center;
}

 /* Chatfenster */
.chat-window {
  height: 550px;
  overflow-y: scroll;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  width: 100%;
}
.message {
  margin-bottom: 5px;
}
.user-message {
  display: block;
  background-color: #a5c4e2;
  padding: 5px 10px;
  margin-left: 25px;
  border-radius: 10px;
}
.assistant-message {
  display: block;
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 10px;
  margin-right: 25px;
}
.input-container {
  display: flex;
  align-items: center;
}
.text-input{
  margin-right: 10px;
  width:85%;
}
.send-btn {
  width: 15%;
  height: 100%;
}

/* Loader */
.loader_upload {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #1976D2;
  width: 120px;
  height: 120px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}
.loader_send {
  border: 13px solid #f3f3f3;
  border-radius: 50%;
  border-top: 13px solid #1976D2;
  width: 50px;
  height: 50px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}
.loader_container {
  display: flex;
  justify-content: center;
  width: 15%;
}

/* File-Uploader */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
input[type="file"]::file-selector-button {
  border-radius: 4px;
  padding: 0 16px;
  height: 40px;
  cursor: pointer;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.16);
  box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.05);
  margin-right: 16px;
  transition: background-color 200ms;
}
input[type="file"]::file-selector-button:hover {
  background-color: #f3f4f6;
}
input[type="file"]::file-selector-button:active {
  background-color: #e5e7eb;
}
.uploader {
  background-color: #e2e2e2;
  padding: 30px;
  border-radius: 10px;

}
.upload-btn{
  width: 100%;
  margin-top: 15px;
  border-radius: 10px;
}
</style>

