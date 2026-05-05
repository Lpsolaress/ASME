# ASME Digital — App de Análisis de Procesos con IA

> Herramienta web que digitaliza el estudio ASME clásico (hecho en Excel) y permite clasificar actividades por departamento, identificar cuáles se pueden automatizar con IA, y generar un informe ejecutivo. El cliente accede mediante un enlace y puede introducir datos por voz o cuestionario.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend + lógica | Next.js |
| Base de datos | PostgreSQL |
| Deploy / enlace cliente | Vercel / Docker |
| UI / Componentes | shadcn/ui + Tailwind |
| Formularios | React Hook Form + Zod |
| Voz | Faster-Whisper (Backend) |
| Análisis IA | OpenAI API — `gpt-4o` |
| Gráficos | Matplotlib (Backend) |
| Export PDF | `pdfkit` / `reportlab` (Backend) |

---

## Design System

- **Colores:** Negro `#000000`, Amarillo `#FFD600`, Blanco `#FFFFFF`, Gris Industrial `#F3F4F6`
- **Estilo:** High-contrast, industrial, premium.
- **Tipografía:** Geometric sans-serif (Inter / Negrita)
- **Componentes:** Bordes negros gruesos (`border-2 border-black`), inputs totalmente redondeados (`rounded-full`), tarjetas con sombras suaves.

---

## Flujo principal de la aplicación

```
1. Cliente recibe enlace → accede a la app
2. Introduce empresa y departamento
3. Describe actividades una a una (voz o texto)
4. La IA clasifica automáticamente cada actividad
5. Usuario revisa / confirma (o corrige)
6. App analiza todo el conjunto de actividades
7. Se genera dashboard con recomendaciones priorizadas
8. Se exporta informe PDF listo para presentar
```

---

## Pantallas / Componentes de la interfaz

### 1. Landing / Bienvenida
- Fondo negro
- Titular amarillo en negrita: _"Analiza tu proceso en minutos"_
- Subtítulo en blanco
- Botón CTA grande amarillo con texto negro: _"Empezar análisis"_
- Decoración geométrica minimalista con líneas amarillas finas

### 2. Stepper de progreso (4 pasos)
- Barra horizontal, fondo blanco
- Círculos numerados conectados por líneas finas
- Estado activo: círculo relleno amarillo, número negro
- Estado completado: círculo negro con check blanco
- Estado pendiente: círculo con borde gris
- Etiquetas en texto pequeño gris debajo de cada paso

### 3. Formulario de datos de empresa (Paso 1)
Campos:
- Nombre de empresa
- Departamento
- Convenio mensual (minutos)
- Minutos por hora

Comportamiento:
- Labels en negro, bordes gris claro, foco en amarillo
- Botón "Continuar" en la esquina inferior derecha

### 4. Entrada de actividad por voz (Paso 2)
- Botón micrófono central grande en amarillo con icono negro
- Animación de pulso cuando está escuchando
- Área de transcripción en tiempo real
- Opción alternativa: _"o escribe aquí"_

**Validación:** ¿Funciona la Web Speech API en los navegadores objetivo? ¿Se necesita fallback?

### 5. Tarjeta de resultado IA (clasificación automática)
Muestra tras describir la actividad:
- Nombre de la actividad (negrita negra)
- Badge de categoría en amarillo
- 3 pills de datos: tiempo/unidad · volumen diario · minutos anuales
- Tag VA / NVA (verde / rojo)
- Botón editar + botón confirmar (amarillo)

### 6. Lista de actividades añadidas
- Barra vertical amarilla a la izquierda de cada tarjeta
- Nombre en negrita + badge de categoría
- Datos de tiempo/volumen en texto gris pequeño
- Minutos anuales en número grande a la derecha
- Barra sticky inferior: total minutos diarios en amarillo
- Botón `+` para añadir nueva actividad

### 7. Loading — Análisis IA
- Fondo negro
- Spinner o barra de progreso animada en amarillo
- Título blanco: _"Analizando tus actividades..."_
- 3 items en blanco con checkmarks que aparecen secuencialmente

### 8. Dashboard de resultados
4 métricas en tarjetas (fondo negro, número amarillo, etiqueta blanca):
- Total actividades
- % automatizables
- Horas ahorradas / año
- Acciones prioritarias

Gráfico de barras horizontal: actividades ordenadas por potencial de automatización (amarillo → gris)

### 9. Tarjeta de recomendación de automatización
- Score grande (ej. `87%`) con anillo de progreso circular fino
- Nombre de actividad en negrita
- Justificación IA en gris (una línea)
- 2–3 pills amarillas con herramientas sugeridas (ej. `Computer Vision`, `RPA`, `LLM`)
- Badge de prioridad: fondo negro, texto amarillo

### 10. Exportar informe
- Preview miniatura del PDF (cabecera negra, detalles en amarillo)
- Botón "Descargar PDF" (negro, texto blanco)
- Botón "Compartir enlace" (amarillo, texto negro)
- Input de copia de enlace con icono negro

---

## Lógica de clasificación IA

### Qué introduce el usuario
Solo describe la actividad con sus propias palabras, por voz o texto. Ejemplo:

> _"Revisamos cada pieza que sale de la línea para ver si tiene defectos visuales, tardamos unos 2 minutos por pieza y hacemos unas 40 al día"_

### Qué extrae Claude automáticamente
```json
{
  "nombre": "Inspección visual de piezas",
  "tiempo_unidad": 2,
  "volumen_diario": 40,
  "unidad": "pieza",
  "categoria": "Revisión",
  "clasificacion": "NVA",
  "justificacion": "Es una revisión de calidad sin transformación del producto"
}
```

### Categorías ASME y sus reglas
| Categoría | Descripción | Clasificación habitual |
|-----------|-------------|------------------------|
| Operación | Transforma o procesa el producto | VA |
| Revisión / Inspección | Comprueba sin transformar | NVA |
| Traslado | Mueve material o información | NVA |
| Espera | Tiempo sin actividad | NVA |
| Archivo / Almacén | Guarda o recupera | NVA |

Estas reglas se incluyen en el **system prompt** para garantizar una clasificación consistente.

### Implementación recomendada
- Usar **streaming** para que la tarjeta aparezca mientras Claude responde (no después).
- Esto da sensación de respuesta en tiempo real y mejora la percepción de velocidad.
- Con el SDK de Anthropic en Next.js: ~10 líneas de código.

---

## Prompt de análisis final (resumen de automatización)

```
Analiza estas actividades de un estudio ASME de una empresa industrial.
Para cada una, devuelve un JSON con:
- score de automatización (0–100)
- herramientas concretas de IA recomendadas
- justificación breve

Responde SOLO con JSON válido, sin texto adicional.
```

---

## Diferenciadores vs. el Excel original

| Excel | ASME Digital |
|-------|-------------|
| Clasificación manual | Clasificación automática por IA |
| Estático | Genera informe ejecutivo en PDF |
| Uso interno | Enlace compartible con el cliente |
| Sin análisis | Score de automatización por actividad |
| Formación necesaria | Cualquier operario lo puede usar por voz |

**Funcionalidad adicional a valorar:** comparativa anónima entre empresas del mismo sector (si se almacenan datos anonimizados en Supabase).

---

## Prompts de diseño para Stitch.ai

### Contexto inicial (enviar solo una vez)

```
I'm building a web app called "ASME Digital" — an industrial process 
analysis tool that helps companies identify which work activities can 
be automated with AI.

Design system:
- Colors: Black #111111, Yellow #FFD600, White #FFFFFF
- Style: Clean, modern, corporate. No gradients, no illustrations.
- Font: Geometric sans-serif (like Inter or DM Sans)
- Components: flat design, 1px borders, 12px border radius
- Mood: professional but approachable, like a modern SaaS tool

I'll be asking you to design several screens for this app one by one.
```

### Sufijo a añadir en cada prompt
```
Style: clean, modern, professional. Font: geometric sans-serif. 
No gradients. No illustrations. Yellow #FFD600, Black #111111, White #FFFFFF.
```

### Referencia de estilo para correcciones
Cuando algo no convence, no reescribir desde cero. Indicar directamente:
```
Same component but [make the cards more compact / change the button 
style to outlined / the yellow is too bright, tone it down]
```

Para pedir más limpieza y modernidad, incluir referencias explícitas:
```
Apple-level cleanliness. Professional SaaS like Linear or Vercel. 
The only color accent is yellow #FFD600.
```

---

## Checklist de validación por pantalla

- [ ] Landing: ¿El CTA lleva correctamente al paso 1?
- [ ] Stepper: ¿Refleja el paso actual en tiempo real?
- [ ] Formulario empresa: ¿Validación con Zod antes de continuar?
- [ ] Voz: ¿Fallback a texto si la API no está disponible?
- [ ] Tarjeta IA: ¿El streaming funciona antes de mostrar la tarjeta?
- [ ] Tarjeta IA: ¿El usuario puede editar los campos si la IA se equivoca?
- [ ] Lista actividades: ¿Se calculan correctamente los minutos anuales?
- [ ] Loading: ¿Se maneja el error si la API falla?
- [ ] Dashboard: ¿Los datos del gráfico están ordenados por score?
- [ ] Export: ¿El PDF incluye todas las actividades y recomendaciones?