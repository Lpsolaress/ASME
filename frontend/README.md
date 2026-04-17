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

- **Colores**:
  - Primario: `#FFD600` (Amarillo)
  - Fondo: `#FFFFFF` (Blanco)
  - Texto/Acentos: `#111111` (Negro)
- **Framework**: Tailwind CSS v4.
- **Micro-animaciones**: Implementadas en CSS para el pulso de voz y transiciones de tarjetas.

## Estructura de Componentes

- `src/components/VoiceCapture.jsx`: Maneja la grabación de audio y la comunicación con el endpoint de transcripción.
- `src/components/ActivityCard.jsx`: Muestra los resultados de la clasificación de la IA y permite la confirmación por parte del usuario.
- `src/app/page.js`: Orquestador principal del flujo del estudio ASME.
