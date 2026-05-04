# ASME Industrial Precision

## Descripción del Proyecto
ASME Industrial Precision es una plataforma digital de alto rendimiento diseñada para ingenieros industriales, orientada al análisis, clasificación y optimización de procesos mediante la metodología ASME. El sistema integra transcripción de voz en tiempo real, clasificación de actividades asistida por IA y analítica visual avanzada para generar reportes técnicos certificados.

## Arquitectura del Sistema
La aplicación sigue una arquitectura cliente-servidor desacoplada, garantizando la escalabilidad de la lógica industrial y el procesamiento de datos. Para un detalle profundo, consulte el archivo [ARCHITECTURE.md](file:///Users/luispe/Downloads/ASME-main/ARCHITECTURE.md).

### 1. Capa Frontend (Next.js 14)
*   **Gestión de Flujo**: Implementa un flujo de trabajo industrial estricto de 5 pasos (Configuración, Captura, Identificación, Análisis, Reporte).
*   **Estado del Sistema**: Manejo centralizado de sesiones y actualizaciones de actividades en tiempo real.
*   **Diseño Industrial**: Interfaz de alto impacto visual basada en Tailwind CSS con un sistema de diseño de alto contraste (Negro/Amarillo).

### 2. Capa Backend (FastAPI)
*   **Motor de IA**: Integración con GPT-4o para el análisis semántico y clasificación ASME de lenguaje natural.
*   **Persistencia**: PostgreSQL/Supabase para el almacenamiento de sesiones y planes de optimización.
*   **Servicio de Reportes**: Generación de informes PDF de grado industrial con gráficos técnicos dinámicos.

## Stack Tecnológico
*   **Frontend**: React, Next.js, Tailwind CSS, Lucide-React.
*   **Backend**: Python, FastAPI, Psycopg2, ReportLab.
*   **IA**: OpenAI API (GPT-4o).
*   **Base de Datos**: PostgreSQL.

## Flujo de Operación
1.  **Fase 1 - Setup**: Definición de metadatos de la empresa y parámetros del proyecto.
2.  **Fase 2 - Captura**: Entrada de datos mediante voz o texto manual.
3.  **Fase 3 - Identificación**: Clasificación ASME en tiempo real (VA/NVA) y mapeo de tiempos.
4.  **Fase 4 - Análisis Estratégico**: Dashboard con módulos técnicos y hoja de ruta de automatización.
5.  **Fase 5 - Certificación**: Generación y descarga del reporte industrial final.

## Instalación y Configuración
Consulte los archivos README específicos en `/Back` y `/frontend` para instrucciones detalladas de despliegue.
