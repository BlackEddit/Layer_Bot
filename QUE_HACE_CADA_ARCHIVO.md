# 📚 ARCHIVOS DEL BOT - QUÉ HACE CADA UNO

## ✅ ARCHIVOS QUE SÍ SE USAN

### 🤖 `bot/whatsapp-bot.js` (468 líneas - LIMPIO)
**EL CEREBRO PRINCIPAL DEL BOT**

**Qué hace:**
- Recibe TODOS los mensajes de WhatsApp
- Decide si responder o ignorar
- Detecta intenciones (saludo, multas, precios, etc.)
- Maneja archivos (fotos de multas, PDFs)
- Ejecuta comandos del dueño (!casos, !pendientes, !audiencias)
- Llama a LawyerPersonality para generar respuestas con IA

**Modifica aquí cuando quieras:**
- Cambiar palabras que detecta ("multa", "hola", etc.)
- Agregar nuevos comandos del dueño
- Cambiar delays de respuesta
- Modificar filtros anti-spam
- Cambiar respuesta cuando recibe foto de multa

**Líneas importantes:**
- **148-170:** Filtros (qué mensajes ignorar)
- **234-265:** Manejo de fotos de multas
- **320-386:** Comandos del dueño
- **388-408:** Filtro anti-spam
- **410-420:** Detección de intenciones
- **422-470:** Generación y envío de respuestas

---

### 🧠 `backend/models/LawyerPersonality.js` (215 líneas)
**LA INTELIGENCIA ARTIFICIAL**

**Qué hace:**
- Se conecta a Groq AI (Llama 3.3 70B)
- Genera respuestas inteligentes y variadas
- Define CÓMO habla el bot (formal, profesional)
- Tiene estrategias para cada intención (saludo, multas, precios)

**Modifica aquí cuando quieras:**
- Cambiar tono del bot (más formal, más casual)
- Agregar/quitar servicios que menciona
- Cambiar precios
- Modificar ejemplos de respuestas
- Ajustar creatividad (temperature: 0.8)

**Líneas importantes:**
- **70-100:** System prompt (quién es el bot, cómo habla)
- **91-98:** Precios y servicios
- **148-195:** Estrategias por intención (saludo, multas, precios, etc.)

---

### 💬 `backend/models/ConversationManager.js`
**HISTORIAL DE CONVERSACIONES**

**Qué hace:**
- Guarda TODAS las conversaciones en `storage/data/conversations.json`
- Recupera historial cuando necesitas contexto
- Organiza mensajes por usuario

**Modifica aquí cuando quieras:**
- Cambiar cuántas conversaciones se guardan
- Agregar campos adicionales (timestamp, ubicación, etc.)

---

### 📋 `backend/models/CaseManager.js`
**GESTIÓN DE CASOS Y CONSULTAS**

**Qué hace:**
- Crea consultas y casos
- Guarda en `storage/data/cases.json`
- Genera estadísticas para el comando !casos
- Maneja audiencias

**Modifica aquí cuando quieras:**
- Agregar nuevos tipos de casos
- Cambiar estructura de consultas
- Agregar campos personalizados

---

### ⏰ `backend/models/ReminderSystem.js`
**SISTEMA DE RECORDATORIOS**

**Qué hace:**
- Guarda recordatorios en `storage/reminders.json`
- Verifica cada minuto si hay recordatorios pendientes
- Envía notificaciones al dueño

**Modifica aquí cuando quieras:**
- Cambiar frecuencia de verificación
- Agregar recordatorios recurrentes
- Enviar recordatorios a clientes

---

### 📸 `backend/helpers/ImageHelper.js`
**ENVÍO DE IMÁGENES**

**Qué hace:**
- Lee imágenes del disco
- Las envía con captions
- Verifica que las imágenes existan

**Modifica aquí cuando quieras:**
- Agregar nuevas funciones de envío de imágenes

---

### 🎨 `backend/config/imageConfig.js`
**CONFIGURACIÓN DE IMÁGENES**

**Qué hace:**
- Define rutas de TODAS las imágenes
- Define textos (captions) que acompañan las imágenes
- Mapea palabras clave → imagen

**Modifica aquí cuando quieras:**
- Cambiar texto de bienvenida
- Agregar nuevas imágenes
- Cambiar captions
- Modificar precios en captions

**Líneas importantes:**
- **10-42:** Rutas de imágenes
- **52-60:** Caption de BIENVENIDA ← IMPORTANTE
- **63-75:** Caption cuando recibe FOTO DE MULTA ← IMPORTANTE

---

## ❌ ARCHIVOS QUE SE ELIMINARON (BASURA)

### ~~`backend/routes/`~~ - **ELIMINADO**
No se usaban. El bot no tiene API REST.

### ~~`backend/controllers/`~~ - **ELIMINADO**
No se usaban. El bot funciona con eventos, no controladores.

### ~~`backend/models/AdvancedConversationTracker.js`~~ - **ELIMINADO**
Nunca se importó ni usó en whatsapp-bot.js

---

## 📂 ESTRUCTURA LIMPIA FINAL

```
BotAbogado/
│
├── bot/
│   ├── whatsapp-bot.js              ← EL CEREBRO (468 líneas limpias)
│   └── whatsapp-bot-VIEJO-BACKUP.js ← Backup del anterior
│
├── backend/
│   ├── models/
│   │   ├── LawyerPersonality.js     ← IA conversacional
│   │   ├── CaseManager.js           ← Gestión de casos
│   │   ├── ConversationManager.js   ← Historial
│   │   └── ReminderSystem.js        ← Recordatorios
│   │
│   ├── helpers/
│   │   └── ImageHelper.js           ← Envío de imágenes
│   │
│   └── config/
│       └── imageConfig.js           ← Config de imágenes
│
├── storage/
│   ├── data/
│   │   ├── cases.json              ← Casos guardados
│   │   └── conversations.json      ← Historial de chats
│   │
│   ├── images/
│   │   ├── marketing/              ← Imágenes del bot
│   │   └── received/               ← Fotos de multas recibidas
│   │
│   └── reminders.json              ← Recordatorios
│
├── .env                            ← Config (API keys)
├── package.json                    ← Dependencias
└── ARQUITECTURA_SIMPLE.md          ← Documentación
```

---

## 🎯 RESUMEN PARA MODIFICAR

### Quiero cambiar QUÉ dice el bot
→ `backend/models/LawyerPersonality.js`

### Quiero cambiar CUÁNDO responde
→ `bot/whatsapp-bot.js` (líneas 410-420)

### Quiero cambiar IMAGEN o su texto
→ `backend/config/imageConfig.js`

### Quiero cambiar comandos del dueño
→ `bot/whatsapp-bot.js` (líneas 320-386)

### Quiero cambiar precios
→ `LawyerPersonality.js` (línea 92)
→ `imageConfig.js` (línea 65-66)
→ `whatsapp-bot.js` (línea 239)

---

## 🔥 CAMBIOS REALIZADOS EN ESTA LIMPIEZA

### ✅ Eliminado:
- `backend/routes/` (7 archivos) - No se usaban
- `backend/controllers/` (3 archivos) - No se usaban
- `AdvancedConversationTracker.js` - Nunca se importó

### ✅ Simplificado:
- `whatsapp-bot.js`: De 731 líneas → 468 líneas
- Comentarios claros en cada sección
- Código más legible y mantenible

### ✅ Mejorado:
- Estructura más clara
- Comentarios explicativos
- Sin código muerto

---

**Ahora el proyecto es MUCHO más fácil de entender y modificar.**
