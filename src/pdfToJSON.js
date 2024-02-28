const pdfParse = require('pdf-parse');

// Funktion, um eine PDF-Datei in JSON zu konvertieren
export default function pdfToJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function(event) {
      const pdfData = event.target.result;

      pdfParse(pdfData).then(function(data) {
        // Konvertieren Sie das von pdf-parse zurückgegebene Objekt in JSON
        const jsonData = JSON.stringify(data);
        resolve(jsonData);
      }).catch(function(error) {
        reject(error);
      });
    };

    reader.onerror = function(error) {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}