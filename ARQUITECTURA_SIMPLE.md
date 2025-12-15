# 🏗️ ARQUITECTURA DEL BOT - JPS DESPACHO JURÍDICO

## 📦 ¿QUÉ TIPO DE ARQUITECTURA ES?

**Sí, es un MONOLITO** - Todo corre en un solo proceso de Node.js.

**NO es MVC tradicional**, pero tiene una separación similar:
- **Models** → Lógica de negocio (LawyerPersonality, CaseManager, etc.)
- **Controllers** → Manejadores de eventos (whatsapp-bot.js)
- **Views** → Mensajes y respuestas (generados por IA)

---

## 🎯 ESTRUCTURA REAL (LO QUE IMPORTA)

```
BotAbogado/
│
├── bot/whatsapp-bot.js          ← CEREBRO PRINCIPAL (aquí llegan los mensajes)
│
├── backend/
│   ├── models/                   ← LÓGICA DE NEGOCIO
│   │   ├── LawyerPersonality.js  ← IA conversacional (Groq)
│   │   ├── CaseManager.js        ← Gestión de casos
│   │   ├── ConversationManager.js← Historial de chats
│   │   └── AdvancedConversationTracker.js ← Analytics
│   │
│   └── config/
│       └── imageConfig.js        ← Configuración de imágenes
│
├── storage/                      ← BASE DE DATOS (JSON)
│   ├── data/
│   │   ├── cases.json           ← Casos y consultas
│   │   ├── conversations.json   ← Historial completo
│   │   └── conversation_analytics.json
│   │
│   └── images/                   ← Imágenes del bot
│       └── marketing/
│           └── bienvenida/
│               └── bienvenida_principal.jpg
│
├── .env                          ← CONFIGURACIÓN (API keys)
└── package.json                  ← Dependencias
```

---

## 🔄 FLUJO DE UN MENSAJE

```
1. Cliente manda "Hola" por WhatsApp
   ↓
2. whatsapp-bot.js recibe el mensaje (event 'message')
   ↓
3. Detecta intención: "saludo"
   ↓
4. Si es saludo simple → Solo envía imagen
   Si no → Llama a LawyerPersonality.generateResponse()
   ↓
5. LawyerPersonality usa Groq AI para generar respuesta
   ↓
6. Respuesta se envía al cliente
   ↓
7. Se guarda en ConversationManager (conversations.json)
```

---

## ⚙️ DÓNDE MODIFICAR CADA COSA

### 🤖 **CAMBIAR PERSONALIDAD DEL BOT**
📁 `backend/models/LawyerPersonality.js`

```javascript
// Línea 70-100: System prompt (quién es el bot)
"Eres el ASISTENTE VIRTUAL de JPS Despacho Jurídico"

// Línea 154-195: Estrategias por intención
case 'saludo':
    return `Es un SALUDO: ...`;
case 'multas':
    return `Habla de MULTAS: ...`;
```

**Modifica aquí para:**
- Cambiar tono (formal, casual, etc.)
- Agregar/quitar servicios
- Cambiar ejemplos de respuestas
- Ajustar instrucciones de comportamiento

---

### 📸 **CAMBIAR IMÁGENES Y TEXTOS**
📁 `backend/config/imageConfig.js`

```javascript
// Línea 25: Rutas de imágenes
BIENVENIDA: path.join(__dirname, '../../storage/images/...'),

// Línea 52: Textos de las imágenes
BIENVENIDA: 
    '⚖️ *BIENVENIDO A JPS DESPACHO JURÍDICO*\n\n' +
    'Defendemos tus derechos con experiencia y profesionalismo.',
```

**Modifica aquí para:**
- Cambiar textos de bienvenida
- Agregar nuevas imágenes
- Modificar captions de imágenes

---

### 🧠 **CAMBIAR DETECCIÓN DE INTENCIONES**
📁 `bot/whatsapp-bot.js` (Línea 613-622)

```javascript
// Detectar intención automáticamente
let detectedIntent = 'general';
if (messageText.includes('hola') || messageText.includes('buenas')) {
    detectedIntent = 'saludo';
} else if (messageText.includes('multa')) {
    detectedIntent = 'multas';
}
```

**Modifica aquí para:**
- Agregar nuevas palabras clave
- Cambiar detección de intenciones
- Agregar nuevas intenciones

---

### 💬 **CAMBIAR RESPUESTAS AUTOMÁTICAS**
📁 `bot/whatsapp-bot.js`

**Foto de multa recibida** (Línea 340-355):
```javascript
fileResponse = `📸 *FOTO DE MULTA RECIBIDA*\n\n` +
    `✅ El Lic. José Patricio la revisará.\n\n` +
    `💰 *INVERSIÓN:* $2,500 MXN\n` +
    // ...
```

**Saludo con imagen** (Línea 628-645):
```javascript
if (detectedIntent === 'saludo' && esSaludoSimple) {
    // Solo enviar imagen, sin texto
    setTimeout(async () => {
        await global.imageHelper.sendImage(message.from, 'BIENVENIDA');
    }, 1500);
    return;
}
```

---

### 💰 **CAMBIAR PRECIOS**
📁 `backend/models/LawyerPersonality.js` (Línea 91-98)

```javascript
SERVICIO PRINCIPAL:
• Impugnación de Multas
• Costo: $2,500 MXN
• Proceso: 6 meses promedio

Otros servicios:
• Laborales: Desde $12,000
• Testamentos: $4,500
```

**También en:** `bot/whatsapp-bot.js` (Línea 185-192)

---

### 🔐 **CAMBIAR CONFIGURACIÓN (API Keys, Teléfonos)**
📁 `.env`

```env
GROQ_API_KEY=tu_api_key_aqui
OWNER_PHONE=5214777244259
DESPACHO_NOMBRE=JPS Despacho Jurídico Profesional
```

---

## 🗄️ BASE DE DATOS (JSON)

### 📋 **Casos y Consultas**
📁 `storage/data/cases.json`

```json
{
  "consultations": [
    {
      "id": "CONS-20241209-001",
      "clientPhone": "5214777244259",
      "clientName": "Juan Pérez",
      "issue": "Multa de tránsito",
      "status": "pending"
    }
  ],
  "cases": []
}
```

### 💬 **Historial de Conversaciones**
📁 `storage/data/conversations.json`

```json
{
  "5214777244259@c.us": [
    {
      "timestamp": "2024-12-09T10:30:00Z",
      "sender": "Cliente",
      "text": "Hola",
      "isFromUser": true
    }
  ]
}
```

---

## 🚀 CÓMO FUNCIONA LA IA (Groq)

### 📍 Archivo: `backend/models/LawyerPersonality.js`

```javascript
async generateResponse(userMessage, context = {}) {
    // 1. Construir prompt con contexto
    const systemPrompt = this.buildSystemPrompt(context);
    
    // 2. Llamar a Groq AI (Llama 3.3 70B)
    const chatCompletion = await this.groq.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.8,  // Creatividad
        max_tokens: 400    // Respuestas cortas
    });
    
    // 3. Retornar respuesta
    return chatCompletion.choices[0]?.message?.content;
}
```

**Parámetros importantes:**
- `temperature: 0.8` → Más alto = más creativo (varía respuestas)
- `max_tokens: 400` → Respuestas cortas (1-3 líneas)
- `model: llama-3.3-70b-versatile` → Modelo de IA usado

---

## 🎨 SISTEMA DE IMÁGENES

### Cómo envía imágenes el bot:

1. **Imagen configurada en** `imageConfig.js`
2. **ImageHelper** lee la imagen del disco
3. **whatsapp-web.js** envía la imagen con caption

```javascript
// Enviar imagen
await global.imageHelper.sendImage(message.from, 'BIENVENIDA');
```

**Agregar nueva imagen:**
1. Guardar imagen en `storage/images/marketing/`
2. Agregar ruta en `imageConfig.js`:
   ```javascript
   NUEVA_IMAGEN: path.join(__dirname, '../../storage/images/marketing/nueva.jpg'),
   ```
3. Agregar caption:
   ```javascript
   NUEVA_IMAGEN: 'Texto de la imagen',
   ```

---

## 🔧 COMANDOS DEL DUEÑO

El bot detecta si eres el dueño por tu número en `.env`:

```javascript
function isOwner(phoneNumber) {
    const ownerPhone = process.env.OWNER_PHONE || '5214777244259';
    return phoneNumber.includes(ownerPhone);
}
```

**Comandos disponibles:**
- `!casos` → Ver estadísticas
- `!pendientes` → Consultas sin atender
- `!audiencias` → Próximas audiencias
- `!recordatorio` → Crear recordatorio

---

## 📊 ANALYTICS

### Archivo: `backend/models/AdvancedConversationTracker.js`

**Guarda automáticamente:**
- Todas las conversaciones
- Intenciones detectadas
- Sentimiento (positivo/neutral/negativo)
- Conversiones (consulta → caso)

**Ver estadísticas:**
```javascript
const tracker = new AdvancedConversationTracker();
const stats = tracker.getStats();
// { total: 45, converted: 8, conversionRate: 17.78% }
```

---

## 🚫 ANTI-SPAM

📁 `bot/whatsapp-bot.js` (Línea 382-400)

```javascript
const isRelevantMessage = 
    // Multas
    messageText.includes('multa') || messageText.includes('infracción') ||
    // Servicios legales
    messageText.includes('abogado') || messageText.includes('legal') ||
    // Saludos
    messageText.includes('hola') || messageText.includes('buenos');

if (!isRelevantMessage) {
    console.log('🚫 Mensaje no relevante ignorado');
    return;
}
```

**El bot NO responde a:**
- Stickers
- Audios
- Videos
- Mensajes sin palabras clave legales
- Grupos

---

## 🔄 DELAYS Y TIMING

### Para que parezca humano:

```javascript
// Primer mensaje: 3-8 segundos
delay = Math.floor(Math.random() * 5000) + 3000;

// Conversación activa: 1-3 segundos  
delay = Math.floor(Math.random() * 2000) + 1000;

// Después de inactividad: 2-5 segundos
delay = Math.floor(Math.random() * 3000) + 2000;
```

📁 `bot/whatsapp-bot.js` (Línea 442-454)

---

## 🐛 DEBUG Y LOGS

El bot imprime logs en terminal:

```
📩 Mensaje recibido: Hola
👤 De: 5214777244259@c.us
🎯 Intención detectada: saludo
⏳ 🆕 PRIMER MENSAJE - Esperando 3991ms...
📸 Imagen de bienvenida enviada (sin texto previo)
```

**Agregar más logs:**
```javascript
console.log('🔍 Debug:', variable);
```

---

## 📦 DEPENDENCIAS PRINCIPALES

```json
{
  "whatsapp-web.js": "^1.25.0",  // Cliente de WhatsApp
  "groq-sdk": "^0.3.3",          // IA conversacional
  "qrcode-terminal": "^0.12.0",  // Mostrar QR
  "dotenv": "^16.0.3"            // Variables de entorno
}
```

---

## ⚡ VENTAJAS DEL MONOLITO

✅ **Fácil de entender** - Todo en un solo proyecto
✅ **Rápido de modificar** - Cambias un archivo y listo
✅ **Sin complicaciones** - No necesitas orquestar servicios
✅ **Desarrollo rápido** - Ideal para MVP

## ⚠️ DESVENTAJAS

❌ **No escala horizontal** - No puedes tener múltiples instancias fácilmente
❌ **Acoplamiento** - Si falla una parte, falla todo
❌ **Difícil de testear** - Todo está mezclado

---

## 🔮 SI QUISIERAS PASAR A MICROSERVICIOS

Podrías separar en:

1. **Bot Service** → Maneja WhatsApp
2. **AI Service** → Genera respuestas (Groq)
3. **Case Service** → Gestiona casos
4. **Analytics Service** → Tracking y reportes
5. **API Gateway** → Punto de entrada único

Pero **para tu caso actual (despacho jurídico), el monolito es PERFECTO**. No necesitas más.

---

## 🎯 RESUMEN EJECUTIVO

### Para modificar comportamiento:
→ `backend/models/LawyerPersonality.js`

### Para cambiar detección de mensajes:
→ `bot/whatsapp-bot.js`

### Para cambiar imágenes/textos:
→ `backend/config/imageConfig.js`

### Para cambiar precios:
→ `LawyerPersonality.js` + `whatsapp-bot.js`

### Para configurar API/teléfonos:
→ `.env`

### Para ver datos guardados:
→ `storage/data/*.json`

---

**¿Necesitas modificar algo específico? Dime qué quieres cambiar y te digo exactamente dónde y cómo.**
