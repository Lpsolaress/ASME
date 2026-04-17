import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from pydantic import BaseModel
from openai import OpenAI
import shutil
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ASME Digital API")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ActivityClassification(BaseModel):
    name: str
    category: str
    classification: str
    time_unit: float
    volume_daily: int
    justification: str

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Whisper model (base)
# Note: This will download the model on first run
model_size = "base"
model = WhisperModel(model_size, device="cpu", compute_type="int8")

@app.get("/health")
async def health_check():
    return {"status": "ok", "model": model_size}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Save temporary file
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Transcribe
        segments, info = model.transcribe(temp_file, beam_size=5)
        
        text = " ".join([segment.text for segment in segments])
        
        # Cleanup
        os.remove(temp_file)
        
        return {
            "text": text.strip(),
            "language": info.language,
            "duration": info.duration
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify")
async def classify_activity(data: dict):
    text = data.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    system_prompt = """
    Eres un experto en ingeniería industrial y metodología ASME. 
    Tu tarea es extraer datos estructurados de una descripción de actividad laboral.
    
    Reglas de Categoría:
    - Operación: transforma o procesa el producto -> casi siempre VA
    - Revisión/Inspección: comprueba sin transformar -> casi siempre NVA
    - Traslado: mueve material o información -> NVA
    - Espera: tiempo sin actividad -> NVA puro
    - Archivo/Almacén: guarda o recupera -> NVA

    Reglas de Clasificación:
    - VA: Valor Añadido
    - NVA: No Valor Añadido
    
    Extrae: nombre, categoría, clasificación, tiempo por unidad (minutos), volumen diario.
    Responde ÚNICAMENTE en JSON.
    """

    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            response_format=ActivityClassification
        )
        
        return response.choices[0].message.parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
