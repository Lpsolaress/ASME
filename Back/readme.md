# Servicio Backend ASME Industrial

## Índice de Documentación
*   [Volver al Inicio](../README.md)
*   [Arquitectura Detallada](../ARCHITECTURE.md)
*   [Manual del Frontend](../frontend/README.md)

---

## Funcionalidad Principal
El servicio backend proporciona la inteligencia computacional y analítica para la plataforma ASME. Gestiona la persistencia de datos, la clasificación de procesos impulsada por IA y la generación de informes técnicos.

## Arquitectura Técnica
El servicio está construido sobre FastAPI, utilizando patrones asíncronos para el manejo eficiente de tareas de E/S, como operaciones de base de datos y llamadas a la API de IA.

### Endpoints de la API
*   **POST /sessions**: Inicializa una nueva sesión de ingeniería con metadatos de la empresa.
*   **POST /classify**: Procesa texto para extraer parámetros ASME (Nombre, Categoría, Clasificación, Tiempo).
*   **POST /activities**: Persiste datos de actividades vinculados a una sesión.
*   **GET /sessions/{id}/activities**: Recupera todas las actividades registradas en una sesión.
*   **POST /analyze**: Genera un plan de optimización integral basado en los datos de la sesión.
*   **GET /export-pdf/{id}**: Genera un reporte PDF industrial certificado con analítica visual.

### Modelo de Datos
*   **Sesión**: Contiene el contexto organizacional y parámetros de acuerdo mensual.
*   **Actividad**: Mapeo detallado de tareas incluyendo clasificación VA/NVA y carga anual.
*   **Plan de Optimización**: Resultado estratégico de la IA con proyecciones de ROI.

### Servicios Internos
*   **Base de Datos**: Gestión de conexiones y operaciones CRUD.
*   **Servicio de IA**: Interfaz para el procesamiento semántico y extracción de datos estructurados.
*   **Servicio PDF**: Renderiza informes técnicos utilizando ReportLab e integra gráficos de Matplotlib.

## Configuración
El servicio requiere las siguientes variables de entorno en un archivo `.env`:
*   `DATABASE_URL`: Cadena de conexión para PostgreSQL/Supabase.
*   `OPENAI_API_KEY`: Clave de autenticación para servicios de IA.

## Ejecución Local
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
