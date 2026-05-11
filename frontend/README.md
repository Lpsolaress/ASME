# Aplicación Frontend ASME Digital

Este es el cliente web de la plataforma ASME Digital, construido con Next.js y Tailwind CSS. La interfaz está optimizada para dispositivos móviles y escritorio, siguiendo un estándar estético industrial de alto contraste.

## Requisitos de Instalación

Asegúrese de contar con las siguientes herramientas instaladas en su estación de trabajo:

### 1. Node.js (Versión 18.0 o superior)
Se recomienda el uso de la versión LTS actual de Node.js para garantizar la compatibilidad con los paquetes de Next.js y las librerías de componentes.

### 2. Gestor de Paquetes (npm o yarn)
El proyecto utiliza npm por defecto para la gestión de dependencias.

## Pasos para la Configuración Local

Siga estos pasos para desplegar la aplicación en su entorno de desarrollo local:

### 1. Navegar al directorio del frontend
```bash
cd frontend
```

### 2. Instalar las dependencias del proyecto
Este paso descargará todas las librerías necesarias, incluyendo Tailwind CSS, Lucide React y componentes de UI.
```bash
npm install
```

### 3. Configuración de conexión con el Backend
La aplicación está configurada para conectarse por defecto a `http://localhost:8000`. Si su servidor backend se encuentra en otra dirección o puerto, verifique la variable de configuración en el archivo correspondiente (generalmente en src/app/page.js o archivos de configuración de entorno).

## Ejecución en Desarrollo

Para iniciar el servidor de desarrollo con Hot Module Replacement (HMR):

```bash
npm run dev
```

La aplicación estará accesible en: `http://localhost:3000`

## Características Técnicas

- Framework: Next.js 14+ con App Router.
- Estilo: Tailwind CSS con sistema de diseño de alto contraste.
- Iconografía: Lucide React.
- Validación de Formularios: React Hook Form y Zod.
- Transcripción de Voz: API de MediaRecorder integrada para captura de audio nativa.

## Estructura de la Aplicación

- src/app: Contiene las rutas y el layout principal de la aplicación.
- src/components: Biblioteca de componentes modulares (SessionSetup, ActivityList, ProcessAnalysis, etc.).
- public: Activos estáticos, imágenes y fuentes.
- next.config.mjs: Configuración del framework Next.js.
