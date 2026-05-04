# Aplicación Frontend ASME Industrial

## Experiencia de Usuario e Interfaz
El frontend es una aplicación React de alto rendimiento basada en Next.js, diseñada para proporcionar una experiencia técnica fluida para ingenieros industriales. Prioriza la claridad de los datos y el impacto visual mediante un sistema de diseño industrial premium.

## Implementación del Flujo de Trabajo
La aplicación implementa un flujo de trabajo secuencial de cinco etapas:

1.  **Setup (SessionSetup.jsx)**: Captura metadatos del proyecto con validación Zod.
2.  **Captura de Datos (ActivityList.jsx)**: Entrada de actividades mediante transcripción de voz en tiempo real.
3.  **Identificación (ActivityCard.jsx)**: Retroalimentación inmediata sobre los resultados de clasificación de la IA.
4.  **Análisis (ProcessAnalysis.jsx)**: 
    *   **Vista de Módulos**: Desglose de ingeniería detallado por actividad.
    *   **Hoja de Ruta**: Recomendaciones estratégicas de automatización con mapeo de ROI.
5.  **Reporte Final (FinalReport.jsx)**: Dashboard de resumen ejecutivo con descarga de PDF certificado.

## Arquitectura de Componentes
*   **Diseño Atómico**: Componentes modulares para reutilización (Botones, Tarjetas, Steppers).
*   **Gestión de Estado**: Hooks de React para manejar el estado complejo de las sesiones y actividades.
*   **Estética Industrial**: Uso de Tailwind CSS para implementar una visual "System Engine" de alto contraste (Negro/Amarillo).

## Principios de Diseño
*   **Alto Contraste**: Uso de negro profundo y amarillo industrial para máxima legibilidad.
*   **Tipografía Técnica**: Enfoque en encabezados claros y familias de fuentes técnicas.
*   **Micro-animaciones**: Transiciones sutiles para cambios de estado (AnalysisLoader.jsx).

## Instalación y Desarrollo
```bash
npm install
npm run dev
```
La aplicación será accesible en `http://localhost:3000`.
