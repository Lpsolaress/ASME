import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from faster_whisper import WhisperModel
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

from services.database import DatabaseService
from services.pdf_service import PDFService

load_dotenv()

app = FastAPI(title="ASME Digital API")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
db = DatabaseService()

# --- Models ---
class ActivityClassification(BaseModel):
    name: str
    category: str
    classification: str
    time_unit: float
    volume_daily: int
    justification: str

class SessionCreate(BaseModel):
    company_name: str
    department: str

class ActivitySave(BaseModel):
    session_id: str
    data: dict

class OptimizationSuggestion(BaseModel):
    activity_name: str
    action: str # e.g. "Automatizar", "Rediseñar", "Eliminar"
    tool_type: str # e.g. "RPA", "IA Generativa", "OCR"
    reasoning: str
    impact: str # "Alto", "Medio", "Bajo"

class OptimizationPlan(BaseModel):
    executive_summary: str
    suggestions: list[OptimizationSuggestion]
    estimated_annual_savings_min: int

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI Models ---
model_size = "base"
model = WhisperModel(model_size, device="cpu", compute_type="int8")

# --- Endpoints ---

@app.get("/health")
async def health_check():
    return {"status": "ok", "model": model_size}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        segments, info = model.transcribe(temp_file, beam_size=5)
        text = " ".join([segment.text for segment in segments])
        os.remove(temp_file)
        
        return {"text": text.strip(), "language": info.language, "duration": info.duration}
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
    
    Reglas de Categoría (Usa exactamente estos nombres):
    - Operación: transforma o procesa el producto
    - Revisión: comprueba sin transformar
    - Traslado: mueve material o información
    - Espera: tiempo sin actividad
    - Archivo: guarda o recupera

    Reglas de Clasificación:
    - VA: Valor Añadido
    - NVA: No Valor Añadido
    
    Extrae: nombre, categoría, clasificación, tiempo por unidad (minutos), volumen diario.
    Responde ÚNICAMENTE en JSON válido.
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

# --- Persistence Endpoints ---

@app.post("/sessions")
async def create_session(session: SessionCreate):
    result = db.create_session(session.company_name, session.department)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create session in Supabase")
    return result

@app.post("/activities")
async def save_activity(payload: ActivitySave):
    result = db.add_activity(payload.session_id, payload.data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to save activity")
    return result

@app.get("/sessions/{session_id}/activities")
async def get_activities(session_id: str):
    return db.get_session_activities(session_id)

@app.delete("/activities/{activity_id}")
async def delete_activity(activity_id: str):
    success = db.delete_activity(activity_id)
    if not success:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"status": "success"}

@app.get("/export-pdf/{session_id}")
async def export_pdf(session_id: str, include_analysis: bool = False):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    activities = db.get_session_activities(session_id)
    if not activities:
        raise HTTPException(status_code=400, detail="No activities to export")
    
    # Optional global analysis for the PDF
    global_analysis = None
    if include_analysis:
        try:
            global_analysis = await analyze_session_data(session_id)
        except:
            pass # Continue without analysis if it fails

    pdf_buffer = PDFService.generate_asme_report(session, activities, global_analysis)
    
    headers = {
        'Content-Disposition': f'attachment; filename="Informe_ASME_{session["company_name"]}.pdf"'
    }
    return StreamingResponse(pdf_buffer, media_type='application/pdf', headers=headers)

async def analyze_session_data(session_id: str):
    session = db.get_session(session_id)
    activities = db.get_session_activities(session_id)
    
    # Format activities for the prompt
    activities_str = "\n".join([
        f"- {a['name']} ({a['category']}, {a['classification']}): {a['time_unit']} min, {a['volume_daily']}/día."
        for a in activities
    ])

    system_prompt = f"""
    Eres un consultor senior en Ingeniería Industrial y Transformación Digital.
    Has realizado un estudio ASME para la empresa {session['company_name']} en el departamento {session['department']}.
    
    Tu objetivo es proponer un Plan de Optimización de Procesos.
    Debes identificar oportunidades en tareas NVA (desperdicio) y también eficiencias en tareas VA (valor añadido).
    Propón soluciones genéricas de software (ej: RPA, IA, OCR, Automatización de workflows).
    """

    user_prompt = f"""
    Analiza este listado de actividades y devuelve un plan de optimización estructurado:
    {activities_str}
    
    Céntrate en el impacto anual y la viabilidad técnica.
    """

    response = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format=OptimizationPlan
    )
    return response.choices[0].message.parsed

@app.get("/sessions/{session_id}/analyze")
async def get_session_analysis(session_id: str):
    try:
        analysis = await analyze_session_data(session_id)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
