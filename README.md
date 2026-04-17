# ASME Digital 🏭🧠

**ASME Digital** es una herramienta de ingeniería industrial diseñada para modernizar y agilizar el mapeo de procesos empresariales. Utiliza Inteligencia Artificial para transformar descripciones en lenguaje natural (voz o texto) en estudios **ASME** estructurados, identificando automáticamente oportunidades de automatización y ahorro de tiempo.

## 🚀 Valor Diferencial

A diferencia de las hojas de Excel tradicionales, ASME Digital elimina la fricción de la entrada de datos:
- **Captura por Voz**: Los operarios narran sus actividades en tiempo real.
- **Clasificación Automática**: La IA identifica si una tarea añade valor (VA) o no (NVA) y la categoriza según la metodología ASME.
- **Dashboard de Impacto**: Resultados visuales inmediatos con cálculo de ROI y minutos anuales ahorrados.

## 🛠️ Stack Tecnológico

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), React, Tailwind CSS.
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python).
- **Transcripción**: [faster-whisper](https://github.com/SYSTRAN/faster-whisper) (Whisper `base` ejecutado localmente).
- **Inteligencia**: [OpenAI API](https://openai.com/) (GPT-4o Mini para clasificación avanzada).
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL).

## 🧩 Estructura del Proyecto

```text
Proyecto-ASME/
├── Back/        # Servidor Python (IA, Transcripción, Clasificación)
├── frontend/    # Aplicación Next.js (Interfaz de usuario premium)
└── README.md    # Documentación general
```

## ⚙️ Configuración y Ejecución

Consulta los README específicos de cada carpeta para instrucciones detalladas:

- [Configuración del Backend](./Back/readme.md)
- [Configuración del Frontend](./frontend/README.md) (Pendiente de completar)

## 📊 Metodología ASME Integrada

La IA clasifica automáticamente las actividades según las reglas estándar:
- **Operación**: Transforma o procesa → **VA**
- **Revisión/Inspección**: Comprueba sin transformar → **NVA**
- **Traslado**: Mueve material o información → **NVA**
- **Espera**: Tiempo sin actividad → **NVA**
- **Archivo/Almacén**: Guarda o recupera → **NVA**

---
Desarrollado con enfoque en la eficiencia productiva y la transformación digital industrial.
