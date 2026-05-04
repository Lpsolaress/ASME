# Arquitectura del Sistema - ASME Industrial Precision

## Índice de Documentación
*   [🏠 Volver al Inicio](README.md)
*   [🖥️ Documentación del Frontend](frontend/README.md)
*   [⚙️ Documentación del Backend](Back/README.md)

---

## 1. Arquitectura de Alto Nivel
La plataforma utiliza una arquitectura desacoplada diseñada para la resiliencia industrial y el procesamiento de datos en tiempo real.

```mermaid
graph TD
    User((Ingeniero Industrial))
    
    subgraph "Capa de Cliente (Next.js)"
        UI[Dashboard Industrial]
        State[Estado Global / Sesión]
        Charts[Motor Visual SVG]
    end
    
    subgraph "Capa de Servidor (FastAPI)"
        API[API Gateway]
        AIService[Procesamiento IA]
        PDFGen[Motor de Reportes PDF]
    end
    
    subgraph "Capa de Persistencia"
        DB[(Base de Datos SQL)]
    end
    
    User <--> UI
    UI <--> State
    State <--> API
    API <--> AIService
    API <--> PDFGen
    API <--> DB
```

## 2. Diagrama de Casos de Uso
Representación de las interacciones principales del usuario con el sistema.

```mermaid
graph LR
    User((Ingeniero)) --- UC1(Configurar Sesión)
    User --- UC2(Capturar Actividades)
    User --- UC3(Validar Clasificación ASME)
    User --- UC4(Analizar Hoja de Ruta)
    User --- UC5(Descargar Reporte PDF)
    
    UC2 -.->|incluye| UC_IA(Clasificación IA)
    UC3 -.->|persiste| DB[(DB)]
    UC5 -.->|genera| UC_PDF(Gráficos Técnicos)
```

## 3. Flujo de Datos Secuencial
Muestra el ciclo de vida de una solicitud desde la captura hasta la certificación.

```mermaid
sequenceDiagram
    participant U as Ingeniero
    participant F as Frontend
    participant B as Backend
    participant AI as IA (GPT-4o)
    participant D as Base de Datos

    U->>F: Ingresa actividad (Voz/Texto)
    F->>B: Solicitud de Clasificación
    B->>AI: Análisis Semántico
    AI-->>B: Respuesta Estructurada
    B-->>F: Clasificación Visual
    F->>B: Guardar Actividad Confirmada
    B->>D: Registro en SQL
    U->>F: Generar Análisis de Optimización
    F->>B: Ejecutar Motor de IA
    B->>AI: Proyectar ROI y Roadmap
    B-->>F: Visualización Dashboard (Paso 4)
    F->>B: Exportar Reporte Certificado
    B->>B: Renderizado PDF Industrial
    B-->>U: Descarga de Documento
```

## 4. Desglose de Componentes Críticos

### Backend (Python/FastAPI)
*   **main.py**: Orquestación de rutas y gestión de errores.
*   **services/database.py**: Abstracción de la capa de datos (Psycopg2).
*   **services/pdf_service.py**: Generador de alta fidelidad con ReportLab.

### Frontend (React/Next.js)
*   **Paso 1-2**: Configuración de sesión y captura de datos distribuida.
*   **Paso 3**: Inventario dinámico con edición en tiempo real.
*   **Paso 4**: Dashboard modular con tarjetas de ingeniería y hoja de ruta.
*   **Paso 5**: Certificación final y punto de exportación.
