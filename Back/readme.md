# ASME Digital - Backend

Este es el servidor backend para la aplicación ASME Digital, encargado de la transcripción de voz local (Whisper) y la clasificación inteligente de actividades (OpenAI).

## Requisitos Previos

- Python 3.9 o superior.
- Una `OPENAI_API_KEY` válida para la clasificación de actividades.

## Configuración

1. **Entorno Virtual**:
   Se recomienda usar un entorno virtual para gestionar las dependencias:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En macOS/Linux
   # venv\Scripts\activate     # En Windows
   ```

2. **Instalar Dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Variables de Entorno**:
   Crea un archivo `.env` en la carpeta `Back/` con el siguiente contenido:
   ```env
   OPENAI_API_KEY=tu_clave_aqui
   DATABASE_URL=postgresql://localhost:5432/ASME
   ```

## Cómo Correr el Servidor

Desde la carpeta `Back/`, ejecuta:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000


El servidor iniciará en `http://localhost:8000` usando **Uvicorn**.

### Notas sobre Whisper Local
- La primera vez que corras el servidor, se descargará automáticamente el modelo **Whisper `base`** (aprox. 150MB).
- El servidor utiliza `faster-whisper` para una ejecución eficiente en CPU/GPU local.

## Endpoints Principales

- `GET /health`: Verifica el estado del servidor.
- `POST /transcribe`: Recibe un archivo de audio (blob) y devuelve el texto.
- `POST /classify`: Recibe un texto y devuelve el análisis ASME estructurado en JSON.
- `GET /sessions/{id}/analyze`: Genera un plan estratégico de optimización IA para toda la sesión.
- `GET /export-pdf/{id}`: Genera el informe industrial en PDF.
- `DELETE /activities/{id}`: Elimina una actividad.
