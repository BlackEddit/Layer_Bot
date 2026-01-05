# ⚖️ JPS Despacho Jurídico - Bot WhatsApp con IA

Sistema completo de asistente virtual para despacho jurídico con inteligencia artificial, especializado en **impugnación de multas** y gestión automatizada de casos legales.

---

## 🎯 Características Principales

### 🔍 Análisis Automático de Multas (NUEVO)
- **Google Vision OCR** - Extracción automática de datos de fotos
- **12 campos detectados** - Nombre, folio, placas, oficial, etc.
- **95% de precisión** - OCR de alta calidad
- **1,000 análisis gratis/mes** - Sin costo hasta 1,000 imágenes
- **Análisis en tiempo real** - Respuesta en segundos

### 🤖 Asistente Virtual Inteligente
- **IA Conversacional** con Groq (Llama 3.3 70B)
- **Respuestas dinámicas** - Nunca repite el mismo mensaje
- **Contexto inteligente** - Recuerda últimas 3 conversaciones
- **Personalidad profesional** - Asistente del Despacho JPS

### 📊 Analytics Avanzados
- **Tracking completo** de todas las conversaciones
- **Detección automática de intenciones** (multas, laborales, divorcios, etc.)
- **Análisis de sentimiento** (positivo, neutral, negativo)
- **Tasa de conversión** de consultas a casos
- **Métricas en tiempo real**

### ⚡ Automatización Profesional
- **Anti-spam inteligente** - Solo responde mensajes relevantes
- **Gestión de casos** - Crea consultas y casos automáticamente
- **Recordatorios** - Alertas de audiencias y citas
- **Recepción de archivos** - PDFs y fotos de multas
- **Sistema de imágenes** - Presentación profesional automática

---

## 🚀 Instalación

### 1️⃣ Clonar repositorio

```bash
git clone https://github.com/BlackEddit/Layer_Bot.git
cd Layer_Bot
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar variables de entorno

Crear archivo `.env` con:

```env
# API de Groq para IA del bot
GROQ_API_KEY=tu_api_key_aqui

# Número del dueño
OWNER_PHONE=5214777244259

# Información del Despacho
DESPACHO_NOMBRE=JPS Despacho Jurídico Profesional
DESPACHO_TELEFONO=+52 477 724 4259
ABOGADO_TITULAR=Lic. José Patricio Sánchez
```

### 4️⃣ Iniciar bot

```bash
.\start-bot.ps1
```

---

## 📁 Estructura del Proyecto

```
📂 BotAbogado/
├── 🤖 bot/
│   └── whatsapp-bot.js          # Bot principal de WhatsApp
│
├── 🔧 backend/
│   ├── models/                  # Modelos de negocio
│   │   ├── LawyerPersonality.js # Personalidad IA (Groq)
│   │   ├── CaseManager.js       # Gestión de casos/consultas
│   │   ├── ConversationManager.js # Historial de chats
│   │   ├── AdvancedConversationTracker.js # Analytics avanzados
│   │   └── ReminderSystem.js    # Recordatorios de audiencias
│   │
│   ├── config/
│   │   └── imageConfig.js       # Configuración de imágenes
│   │
│   └── helpers/
│       └── ImageHelper.js       # Helper para enviar imágenes
│
├── 💾 storage/
│   ├── data/                    # Base de datos JSON
│   │   ├── cases.json          # Casos y consultas
│   │   ├── conversations.json  # Historial de mensajes
│   │   └── conversation_analytics.json # Analytics
│   │
│   ├── images/
│   │   ├── marketing/          # Imágenes profesionales
│   │   └── received/           # Archivos recibidos (PDFs, fotos de multas)
│   └── reminders.json           # Recordatorios programados
│
├── 📄 .env                      # Variables de entorno (API keys)
├── 📄 package.json              # Configuración del proyecto
├── 📄 COMO_FUNCIONA_TODO.md     # Documentación completa
└── 🚀 start-bot.ps1             # Script de inicio
```

---

## 💬 Ejemplo de Conversación

```
Cliente: "Hola"

Bot: "Buenos días, le atiende JPS Despacho Jurídico. ¿En qué podemos ayudarle?"

[2.5 segundos después envía imagen profesional:]

⚖️ BIENVENIDO A JPS DESPACHO JURÍDICO

Defendemos tus derechos con experiencia y profesionalismo.

🎯 Especialidad: Impugnación de Multas
📱 +52 477 724 4259
📍 León, Guanajuato

¿En qué podemos ayudarte?
```

```
Cliente: "Tengo una multa de tránsito"

Bot: "Entendido. Le puedo ayudar con la impugnación.

⚖️ SERVICIO DE IMPUGNACIÓN:
💰 Inversión: $2,500 MXN
✅ Tasa de éxito: 97% (330 de 340 casos ganados)

📋 NECESITO:
• Foto de la multa
• Licencia de conducir
• Tarjeta de circulación

¿Desea proceder con la impugnación?"
```

---

## 🎯 Funcionalidades Principales

### 🤖 Asistente Virtual con IA
- ✅ **Personalidad profesional** - Asistente del Despacho JPS (no el abogado)
- ✅ **Respuestas dinámicas** - Nunca repite el mismo saludo
- ✅ **Contexto inteligente** - Recuerda últimas 3 conversaciones
- ✅ **Detección de intenciones** - Multas, laborales, divorcios, etc.

### 📊 Analytics Avanzados (NEW)
- ✅ **Tracking completo** - Todas las conversaciones guardadas
- ✅ **Análisis de sentimiento** - Positivo, neutral, negativo
- ✅ **Detección de necesidades** - Legal needs identificadas
- ✅ **Tasa de conversión** - De consulta a caso
- ✅ **Métricas en tiempo real** - Reportes y estadísticas

### 📸 Sistema de Imágenes
- ✅ **Imagen de bienvenida** - Siempre se envía en saludos
- ✅ **19 imágenes configurables** - Logos, servicios, casos éxito
- ✅ **Timing inteligente** - 2.5s después del texto

### 📁 Gestión de Archivos
- ✅ **Recepción de PDFs** - Multas, documentos
- ✅ **Análisis de imágenes** - Fotos de multas
- ✅ **Almacenamiento organizado** - storage/images/received/

### ⏰ Recordatorios
- ✅ **Audiencias** - Alertas automáticas
- ✅ **Citas** - Notificaciones programadas
- ✅ **Seguimiento de casos** - Status updates

### 🛡️ Anti-Spam
- ✅ **Filtro inteligente** - Solo responde mensajes relevantes
- ✅ **Previene bucles** - No responde a otros bots
- ✅ **Validación de contexto** - Detecta intenciones reales


---

## 🔧 Comandos del Dueño

Desde el número configurado como `OWNER_PHONE`:

```
!casos          # Ver estadísticas de casos
!pendientes     # Consultas pendientes
!audiencias     # Próximas audiencias
!recordatorio   # Programar recordatorio
```

---

## 📊 Sistema de Analytics

El bot incluye **AdvancedConversationTracker** que guarda automáticamente:

### Datos Capturados
- ✅ Todas las conversaciones completas
- ✅ Intenciones detectadas automáticamente
- ✅ Análisis de sentimiento (positivo/neutral/negativo)
- ✅ Necesidades legales identificadas
- ✅ Tiempo de respuesta promedio
- ✅ Tasa de conversión a casos
- ✅ Métricas por usuario

### Ver Estadísticas

```javascript
const tracker = new AdvancedConversationTracker();
const stats = tracker.getStats();

console.log(stats);
// Output:
// {
//   total: 45,
//   active: 12,
//   converted: 8,
//   conversionRate: 17.78,
//   totalMessages: 234,
//   commonIntents: [
//     { intent: 'impugnacion_multa', count: 25 },
//     { intent: 'consulta_precio', count: 18 }
//   ],
//   sentimentDistribution: {
//     positive: 28,
//     neutral: 15,
//     negative: 2
//   }
// }
```

---

## 🛠️ Tecnologías

- **Node.js** v18+
- **whatsapp-web.js** v1.25.0 - Cliente de WhatsApp
- **Groq SDK** v0.3.3 - IA conversacional (Llama 3.3 70B)
- **JSON** - Base de datos simple (migrable a PostgreSQL/MySQL)

---

## 📈 Mejores Prácticas Implementadas

Basado en análisis de asistentes exitosos (Intercom, Drift, ChatGPT):

1. **Timing Inteligente**
   - Delays variables según contexto
   - Primer mensaje: 3-8 segundos
   - Conversación activa: 1-3 segundos

2. **Contexto es Rey**
   - Recuerda últimas 3 interacciones
   - No pregunta lo que ya sabe
   - Detecta cambios de tema

3. **Personalización Dinámica**
   - Saludos diferentes cada vez
   - Tono adaptable al cliente
   - Temperature 0.8 para variación natural

4. **Multimedia Estratégico**
   - Imagen solo cuando aporta valor
   - Delay de 2.5s entre texto e imagen
   - Caption profesional con información clave

5. **Respuestas Cortas**
   - Máximo 400 tokens (1-3 líneas)
   - Directo al punto
   - Sin discursos largos

---

## 🚧 Roadmap

### Próximas Funcionalidades
- [ ] Dashboard web para analytics
- [ ] Integración con Google Calendar
- [ ] Base de datos SQL (PostgreSQL)
- [ ] Sistema de pagos integrado
- [ ] Multi-idioma
- [ ] Voice notes support

---

## 📝 Licencia

MIT License

---

## 👤 Autor

**JPS Despacho Jurídico Profesional**
- 📱 WhatsApp: +52 477 724 4259
- 📍 León, Guanajuato, México
- ⚖️ Especialidad: Impugnación de Multas

---

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/Nueva`)
3. Commit (`git commit -m 'Agregar feature'`)
4. Push (`git push origin feature/Nueva`)
5. Pull Request

---

## 📚 Documentación

- [📖 Cómo Funciona Todo](COMO_FUNCIONA_TODO.md) - Explicación completa del sistema
- [📊 Analytics System](backend/models/AdvancedConversationTracker.js) - Sistema de tracking

---

**⭐ Si este proyecto te ayuda, dale una estrella en GitHub!**

*Desarrollado con ❤️ para automatizar despachos jurídicos*


---

## 📱 Uso del Bot

### Para Clientes:
- Enviar mensaje de WhatsApp al número del bot
- Bot responde automáticamente con IA
- Pueden enviar PDFs/fotos de multas
- Agendar citas y consultas

### Comandos del Dueño:
```
!casos          # Estadísticas del despacho
!pendientes     # Consultas sin agendar
!audiencias     # Próximas audiencias
!recordatorio DD/MM/YYYY HH:MM mensaje  # Crear recordatorio
!help           # Ver todos los comandos
```

---

## 🚀 Scripts

```bash
# Iniciar bot (Windows PowerShell)
.\start-bot.ps1

# Iniciar bot (manual)
npm run bot

# Limpiar sesión de WhatsApp
npm run clean
```

---

## 📦 Dependencias Principales

- **whatsapp-web.js** - Cliente de WhatsApp
- **groq-sdk** - IA conversacional (Llama 3.3)
- **qrcode-terminal** - QR para autenticación
- **uuid** - IDs únicos para casos
- **moment** - Manejo de fechas

---

## 🛠️ Mantenimiento

### Limpiar Sesión de WhatsApp
Si el bot no conecta o hay problemas:
```powershell
# Detener bot
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Limpiar caché
Remove-Item -Recurse -Force bot\.wwebjs_auth, bot\.wwebjs_cache

# Reiniciar
.\start-bot.ps1
```

---

## 📊 Base de Datos

Todo se almacena en JSON (sin necesidad de MySQL/MongoDB):
- `storage/data/cases.json` - Casos y consultas
- `storage/data/conversations.json` - Historial de chats
- `storage/reminders.json` - Recordatorios
- `storage/images/received/` - Archivos de clientes

---

## 🔒 Seguridad

- ✅ `.env` en `.gitignore` (API keys protegidas)
- ✅ Sesiones de WhatsApp encriptadas
- ✅ Solo el dueño puede usar comandos administrativos
- ✅ Anti-spam para evitar abusos

---

## 🐛 Troubleshooting

**Bot no conecta:**
```powershell
# Limpiar todo
Get-Process node,chrome -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force bot\.wwebjs_auth, bot\.wwebjs_cache
.\start-bot.ps1
```

**Error de API Groq:**
- Verificar que GROQ_API_KEY esté en .env
- Verificar que la API key sea válida
- Verificar conexión a internet

**Bot no responde:**
- Verificar que el mensaje contenga palabras clave relevantes
- Si eres el dueño, todos los mensajes funcionan

---

## 📞 Soporte

**Autor:** BlackEddit  
**Repo:** WhatSap-Bot-Bisnes-v  
**Branch:** master

---

**⚖️ ¡Bot funcionando para tu despacho jurídico!** 🚀
