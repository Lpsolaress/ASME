# Servicio Backend ASME Industrial

Este es el núcleo computacional de la plataforma ASME, encargado de la gestión de datos, análisis mediante IA y generación de reportes técnicos certificados.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
*   **Python 3.10+**
*   **pip** (gestor de paquetes de Python)
*   **PostgreSQL** (o acceso a una instancia de Supabase)

---

## 🛠️ Configuración e Instalación

Sigue estos pasos para configurar el entorno de desarrollo local:

### 1. Preparar el Entorno Virtual
Es recomendable usar un entorno virtual para aislar las dependencias del proyecto.

```bash
# Navegar a la carpeta del backend
cd Back

# Crear el entorno virtual
python -m venv venv

# Activar el entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows:
# venv\Scripts\activate
```

### 2. Instalar Dependencias
Con el entorno virtual activado, instala todos los paquetes necesarios:

```bash
pip install -r requirements.txt
```

### 3. Configuración de Variables de Entorno
Crea un archivo `.env` en la raíz de la carpeta `/Back` (puedes usar el archivo `.env` existente como base) con las siguientes claves:

```env
OPENAI_API_KEY=tu_clave_de_openai_aqui
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_db
```

---

## Ejecución del Servidor

Para iniciar el servidor en modo desarrollo (con recarga automática):

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: `http://localhost:8000`

---

## 📖 Documentación de la API

FastAPI genera automáticamente documentación interactiva. Una vez que el servidor esté corriendo, puedes acceder a:

*   **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs) (Ideal para probar los endpoints)
*   **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc) (Documentación más limpia y detallada)

---

## Estructura del Proyecto

*   `main.py`: Punto de entrada de la aplicación y definición de rutas.
*   `/database`: Configuración de la conexión y modelos de la base de datos.
*   `/services`: Lógica de negocio (IA, Generación de PDF, etc.).
*   `requirements.txt`: Lista de dependencias del proyecto.

---

## Enlaces de Interés
*   [Volver al Inicio del Proyecto](../README.md)
*   [Arquitectura Detallada](../ARCHITECTURE.md)
*   [Manual del Frontend](../Frontend/README.md)

