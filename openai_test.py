from openai import OpenAI
from dotenv import load_dotenv
import os
import pandas as pd

# Laden Sie die Umgebungsvariablen aus der .env-Datei
load_dotenv()

# Define the path to your Excel file
excel_file_path = '/Users/thiennguyen/Desktop/uni/Master/3. Semester/AA Analytische Anwendungen/Passport Ranking.xlsx'

# Read the Excel file into a pandas DataFrame
df = pd.read_excel(excel_file_path)

client = OpenAI(
   api_key=os.getenv("OPENAI_API_KEY"),
)

completion = client.chat.completions.create(
  model="gpt-4-0125-preview",
  messages = [
    {"role": "system", "content": "Du bist ein Finanzassistent, der sich gut damit auskennt, Tabellen zu evaluieren und Berichte zu schreiben."},
    {"role": "user", "content": "Bitte überprüfe die folgende Tabelle und erstelle einen kurzen Bericht darüber: " + str(df)}
  ] 
)

print(completion.choices[0].message)