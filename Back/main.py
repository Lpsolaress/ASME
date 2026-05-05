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
    task_name: str = ""
    monthly_agreement: float = 0.0
    minutes_per_hour: float = 60.0
    staff_count: int = 1
    hourly_cost: float = 0.0
    initial_classification: str = "VA"

class ActivitySave(BaseModel):
    session_id: str
    data: dict

class ClassifyRequest(BaseModel):
    text: str

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
async def classify_activity(payload: ClassifyRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="El texto de la actividad no puede estar vacío.")

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

    # Mock fallback if API key is not set
    if not os.getenv("OPENAI_API_KEY") or "tu_clave" in os.getenv("OPENAI_API_KEY"):
        return ActivityClassification(
            name=text[:30],
            category="Operación",
            classification="VA",
            time_unit=10.0,
            volume_daily=5,
            justification="[MOCK] Esta es una respuesta de prueba porque no hay API Key configurada."
        )

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
        print(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify")
async def classify_text(request: ClassifyRequest):
    return await classify_activity(request.text)

# --- Persistence Endpoints ---

@app.post("/sessions")
async def create_session(session: SessionCreate):
    result = db.create_session(
        session.company_name, 
        session.department, 
        session.task_name, 
        session.monthly_agreement, 
        session.minutes_per_hour,
        session.staff_count,
        session.hourly_cost
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create session")
    
    # Auto-create first activity based on Phase 1 data
    # volume_daily = monthly_agreement / 20 working days
    vol_daily = max(1, int(session.monthly_agreement / 20))
    first_activity = {
        "name": session.task_name or "Proceso Inicial",
        "category": "Operación",
        "classification": session.initial_classification,
        "time_unit": session.minutes_per_hour,
        "volume_daily": vol_daily,
        "justification": "Generado automáticamente desde la configuración inicial."
    }
    db.add_activity(result["id"], first_activity)
    
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

@app.put("/activities/{activity_id}")
async def update_activity(activity_id: str, payload: dict):
    result = db.update_activity(activity_id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Activity not found")
    return result

@app.get("/export-pdf/{session_id}")
async def export_pdf(session_id: str, include_analysis: bool = False, preview: bool = False):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    activities = db.get_session_activities(session_id)
    
    # Provide mock data if none found to ensure a smooth demo experience
    if not activities:
        activities = [
            {"name": "Inspección de Calidad", "category": "Revisión", "classification": "NVA", "time_unit": 1.5, "volume_daily": 450, "annual_minutes": 162000},
            {"name": "Carga de Datos", "category": "Operación", "classification": "VA", "time_unit": 2.0, "volume_daily": 200, "annual_minutes": 96000},
            {"name": "Empaquetado", "category": "Operación", "classification": "VA", "time_unit": 1.0, "volume_daily": 300, "annual_minutes": 72000}
        ]
    
    # Optional global analysis for the PDF
    global_analysis = None
    if include_analysis:
        try:
            global_analysis = await analyze_session_data(session_id)
        except:
            pass # Continue without analysis if it fails

    pdf_buffer = PDFService.generate_asme_report(session, activities, global_analysis)
    
    filename = session.get('task_name', session.get('company_name', 'ASME'))
    safe_filename = "".join(c for c in filename if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')
    disposition = "inline" if preview else "attachment"
    headers = {
        'Content-Disposition': f'{disposition}; filename="Informe_ASME_{safe_filename}.pdf"'
    }
    return StreamingResponse(pdf_buffer, media_type='application/pdf', headers=headers)
import json
import os
from pydantic import BaseModel

def get_cache_path(session_id):
    return f"analysis_cache_{session_id}.json"

async def analyze_session_data(session_id: str):
    cache_path = get_cache_path(session_id)
    if os.path.exists(cache_path):
        with open(cache_path, 'r') as f:
            data = json.load(f)
            return OptimizationPlan(**data)

    session = db.get_session(session_id)
    activities = db.get_session_activities(session_id)
    
    # Mock fallback if API key is not set
    if not os.getenv("OPENAI_API_KEY") or "tu_clave" in os.getenv("OPENAI_API_KEY"):
        return OptimizationPlan(
            executive_summary=f"[MOCK] Resumen de análisis para el proceso '{session.get('task_name')}'. El sistema recomienda automatizar tareas repetitivas para maximizar el ROI.",
            suggestions=[
                OptimizationSuggestion(
                    activity_name="Tarea de Prueba",
                    action="Automatizar",
                    tool_type="RPA",
                    reasoning="Esta es una sugerencia generada localmente para mostrar el diseño.",
                    impact="Alto"
                )
            ],
            estimated_annual_savings_min=15000
        )

    # Format activities for the prompt
    activities_str = "\n".join([
        f"- {a['name']} ({a['category']}, {a['classification']}): {a['time_unit']} min, {a['volume_daily']}/día."
        for a in activities
    ])

    system_prompt = f"""
    Eres un consultor senior en Ingeniería Industrial y Transformación Digital.
    Has realizado un estudio ASME para la empresa {session['company_name']} en el departamento {session['department']}.
    El proceso específico analizado es: "{session['task_name']}".
    
    Tu objetivo es proponer un Plan de Optimización de Procesos enfocado específicamente en "{session['task_name']}".
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
    result = response.choices[0].message.parsed
    with open(cache_path, 'w') as f:
        json.dump(result.model_dump(), f)
    return result

@app.get("/sessions/{session_id}/analyze")
async def get_session_analysis(session_id: str):
    try:
        analysis = await analyze_session_data(session_id)
        return analysis
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
