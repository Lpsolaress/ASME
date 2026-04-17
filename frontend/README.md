# ASME Digital - Frontend

Este es el cliente web para la aplicación ASME Digital, construido con Next.js y un enfoque en UX/UI de gama alta (Apple-style).

## Requisitos Previos

- Node.js 18 o superior.
- npm o yarn.
- Un servidor backend corriendo (por defecto en `http://localhost:8000`).

## Configuración e Instalación

1. **Instalar Dependencias**:
   ```bash
   npm install
   ```

2. **Variables de Entorno**:
   Si el backend corre en una URL distinta a `localhost:8000`, asegúrate de actualizar los `fetch` en los componentes `VoiceCapture` y `page.js`.

## Cómo Correr la Aplicación de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Diseño y Estilos

- **Componentes**: [shadcn/ui](https://ui.shadcn.com/) (diseño premium personalizado).
- **Métricas**: [Recharts](https://recharts.org/) para visualización de VA/NVA y carga de trabajo.
- **Formularios**: React Hook Form + Zod para validación robusta.
- **Colores**:
  - Primario: `oklch(0.86 0.2 90)` (Amarillo ASME)
  - Fondo: Blanco / Soft Gray (`bg-slate-50/50`)
  - Acentos: Negro profundo.
- **Tipografía**: Font-sans con enfoque en legibilidad industrial.

## Estructura de Componentes

- `src/components/VoiceCapture.jsx`: Maneja la grabación de audio y transcripción Whisper local.
- `src/components/ActivityCard.jsx`: Clasificación ASME interactiva con componentes shadcn.
- `src/components/DashboardCharts.jsx`: Visualización de métricas de proceso mediante Recharts.
- `src/components/SessionSetup.jsx`: Alta de estudio con validación Zod.
- `src/app/page.js`: Dashboard principal con sistema de Tabs y persistencia reactiva.

## Despliegue en Vercel

Este frontend es 100% compatible con Vercel. Asegúrate de configurar la variable de entorno `NEXT_PUBLIC_API_URL` apuntando a tu servidor backend (ej: Render, Railway o tu propia IP).
