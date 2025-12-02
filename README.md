# ⚖️ Bot WhatsApp - Despacho Jurídico Profesional

Sistema de WhatsApp Bot con IA para despacho de abogados especializado en **IMPUGNACIÓN DE MULTAS**.

---

## 🚀 Instalación Rápida

```bash
# 1. Clonar repositorio
git clone [tu-repo]
cd BotAbogado

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Editar .env con tu API key de Groq

# 4. Iniciar bot
.\start-bot.ps1
# O manualmente:
npm run bot
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
│   │   └── ReminderSystem.js    # Recordatorios de audiencias
│   │
│   ├── controllers/             # Lógica de procesamiento
│   └── routes/                  # Rutas de API (opcional)
│
├── 💾 storage/
│   ├── data/                    # Base de datos JSON
│   │   ├── cases.json          # Casos y consultas
│   │   └── conversations.json  # Historial de mensajes
│   │
│   ├── images/received/         # Archivos recibidos (PDFs, fotos de multas)
│   └── reminders.json           # Recordatorios programados
│
├── 📦 node_modules/             # Dependencias
├── 📄 package.json              # Configuración del proyecto
├── 🔧 .env                      # Variables de entorno (API keys)
└── 🚀 start-bot.ps1             # Script de inicio
```

---

## 🎯 Funcionalidades

### 🤖 Bot de WhatsApp
- ✅ **Personalidad IA profesional** con Groq (Llama 3.3)
- ✅ **Impugnación de multas** - Servicio core ($2,500 MXN)
- ✅ **Recepción de archivos** (PDFs, imágenes de multas)
- ✅ **Anti-spam inteligente** - Solo responde mensajes relevantes
- ✅ **Gestión de casos** - Consultas, audiencias, seguimiento
- ✅ **Recordatorios automáticos** - Audiencias y citas
- ✅ **Comandos de dueño** (!casos, !pendientes, !audiencias)

### ⚖️ Servicios Ofrecidos
- 🎯 **Impugnación de Multas:** $2,500 MXN (Tránsito, Fiscal, Administrativa)
- 💼 Consulta Legal: $1,200 MXN/hora
- 💔 Divorcio Express: $12,000 MXN
- 💔 Divorcio Contencioso: Desde $18,000 MXN
- 📜 Testamento: $4,500 MXN
- ⚖️ Demandas Civiles: Desde $15,000 MXN
- 💼 Juicios Laborales: Desde $12,000 MXN
- 🚨 Defensa Penal: Desde $25,000 MXN

---

## 🔧 Configuración

### Variables de Entorno (.env)
```env
# API de Groq para IA (OBLIGATORIO)
GROQ_API_KEY=tu_api_key_de_groq

# Número del dueño del despacho
OWNER_PHONE=5214777244259

# Información del Despacho
DESPACHO_NOMBRE=Despacho Jurídico Profesional
DESPACHO_TELEFONO=+52 477 724 4259
DESPACHO_DIRECCION=Av. Principal #123, Ciudad
```

### Obtener API Key de Groq (GRATIS)
1. Ir a: https://console.groq.com/
2. Crear cuenta gratuita
3. Obtener API key
4. Pegar en `.env`

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
