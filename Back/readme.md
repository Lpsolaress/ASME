# Servicio Backend ASME Digital

Este es el núcleo computacional de la plataforma ASME Digital, responsable del procesamiento de audio mediante IA, la clasificación de procesos industriales y la generación de reportes técnicos certificados.

## Requisitos del Sistema

Para el funcionamiento correcto del backend, es indispensable contar con los siguientes componentes instalados en el sistema:

### 1. Python 3.10 o superior
El motor está desarrollado sobre FastAPI y requiere una versión moderna de Python.

### 2. FFmpeg
FFmpeg es una herramienta de línea de comandos necesaria para que la librería Faster-Whisper pueda procesar y decodificar los archivos de audio .webm capturados por el navegador.
- En macOS (Homebrew): `brew install ffmpeg`
- En Linux (Ubuntu/Debian): `sudo apt update && sudo apt install ffmpeg`
- En Windows: Descargar los binarios de ffmpeg.org y añadirlos al PATH del sistema.

### 3. PostgreSQL
Se requiere una base de datos PostgreSQL activa. El sistema utiliza el driver psycopg2 para la persistencia de sesiones y actividades.

## Instalación y Configuración

Siga estrictamente estos pasos para preparar el entorno:

### 1. Clonar el repositorio y navegar al directorio
```bash
cd Back
```

### 2. Crear y activar un entorno virtual
Es obligatorio usar un entorno virtual para garantizar la compatibilidad de las librerías.
```bash
# Crear
python -m venv venv

# Activar (macOS/Linux)
source venv/bin/activate

# Activar (Windows)
venv\Scripts\activate
```

### 3. Instalar dependencias de Python
Instale todos los paquetes necesarios listados en el archivo de requerimientos.
```bash
pip install -r requirements.txt
```

### 4. Configuración de Variables de Entorno
Cree un archivo llamado `.env` en la carpeta `/Back`. Este archivo debe contener las credenciales de acceso:
```env
OPENAI_API_KEY=su_clave_api_de_openai
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_base_datos
```

## Ejecución del Servidor

Para iniciar el servicio en modo de desarrollo con recarga automática al detectar cambios:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará operativo en: `http://localhost:8000`

## Documentación Técnica de la API

Una vez iniciado el servidor, puede consultar la especificación técnica de los endpoints en:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Estructura de Directorios

- main.py: Lógica de la API y rutas principales.
- services/database.py: Gestión de persistencia y pool de conexiones.
- services/pdf_service.py: Lógica de generación de reportes industriales.
- temp_*: Directorio temporal para el procesamiento de segmentos de audio (se limpian automáticamente).
