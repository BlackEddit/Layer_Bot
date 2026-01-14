# 🛡️ SISTEMA DE SEGURIDAD ANTI-EXTORSIÓN

## 🎯 Objetivo

Proteger a los usuarios del bot contra intentos de extorsión, secuestros virtuales y fraudes telefónicos.

---

## 🚨 Funcionalidades de Seguridad

### 1️⃣ **Identificación Automática**

Cuando alguien escribe por primera vez, el bot se identifica automáticamente:

```
🤖 ASISTENTE AUTOMATIZADO

Hola, soy un *sistema automatizado* de JPS Despacho Jurídico.

⚠️ IMPORTANTE:
• NO soy una persona real
• NO puedo recibir dinero
• NO solicito datos personales sensibles
• NO represento autoridades

📱 Para atención personal:
*Lic. José Patricio Sánchez*
📞 +52 477 724 4259
```

**Objetivo:** Evitar que delincuentes se hagan pasar por el bot para extorsionar.

---

### 2️⃣ **Detección de Extorsión**

El bot analiza cada mensaje en busca de palabras clave asociadas a extorsión:

#### Categorías detectadas:
- **Secuestro virtual:** "secuestrado", "retenido", "hospital", "accidente grave"
- **Amenazas:** "amenaza", "matar", "lastimar", "cartel", "sicario"
- **Extorsión directa:** "deposita", "transfiere", "manda dinero", "tarjeta prepagada"
- **Suplantación de autoridad:** "fiscal", "orden de aprehensión", "multa pendiente"
- **Urgencia extrema:** "es urgente", "inmediatamente", "ahora mismo"

#### Respuesta automática:

Si detecta **2 o más** palabras clave:

```
🚨 ADVERTENCIA DE SEGURIDAD

Este mensaje ha sido identificado como un posible intento de
*EXTORSIÓN o FRAUDE*.

⚠️ *NO proporciones información personal*
⚠️ *NO realices pagos*
⚠️ *NO compartas códigos o contraseñas*

🛡️ *RECOMENDACIONES:*
1. Ignora este mensaje
2. NO respondas
3. Bloquea este número
4. Reporta al 089 (Denuncia Anónima)
```

---

### 3️⃣ **Sistema de Bloqueo Automático**

- **1er intento sospechoso:** Advertencia enviada
- **2do intento sospechoso:** Segunda advertencia
- **3er intento sospechoso:** 🚫 **BLOQUEO AUTOMÁTICO**

Los números bloqueados **NO reciben ninguna respuesta** del bot.

---

### 4️⃣ **Notificaciones al Dueño**

Cuando se detecta un intento de extorsión, el dueño recibe notificación automática:

```
🚨 ALERTA DE SEGURIDAD

Posible intento de extorsión detectado:

📱 Número: +52 123 456 7890
📝 Mensaje: "Tu hijo tuvo un accidente grave..."
⚠️ Palabras clave: secuestrado, hospital, transfiere
🔢 Intentos: 1/3
⚠️ Marcado como sospechoso
```

---

## 🎛️ Comandos de Seguridad (Solo Dueño)

### Ver reporte de seguridad
```
!seguridad
```

**Muestra:**
- Cantidad de números bloqueados
- Cantidad de números sospechosos
- Lista de bloqueados

---

### Bloquear número manualmente
```
!bloquear 5214771234567
```

Bloquea inmediatamente el número indicado.

---

### Desbloquear número
```
!desbloquear 5214771234567
```

Remueve el número de la lista de bloqueados.

---

## 📊 Ejemplos de Detección

### ✅ Ejemplo 1: Secuestro Virtual Detectado

**Mensaje recibido:**
> "Hola, soy del hospital. Tu hijo tuvo un accidente grave y necesitamos que transfieras $50,000 inmediatamente para la operación urgente."

**Palabras detectadas:** hospital, accidente grave, transfiere, inmediatamente, urgente

**Resultado:** 🚫 **5 palabras clave** → Bloqueo automático + advertencia + notificación al dueño

---

### ✅ Ejemplo 2: Extorsión de Autoridad Detectada

**Mensaje recibido:**
> "Soy del Ministerio Público. Tiene una orden de aprehensión. Debe pagar $10,000 en Oxxo ahora mismo o será detenido."

**Palabras detectadas:** ministerio publico, orden de aprehensión, ahora mismo

**Resultado:** 🚫 **3 palabras clave** → Advertencia + registro sospechoso

---

### ❌ Ejemplo 3: Mensaje Normal

**Mensaje recibido:**
> "Hola, tengo una multa de tránsito y quisiera impugnarla. ¿Cuánto cuesta?"

**Palabras detectadas:** Ninguna

**Resultado:** ✅ Conversación normal continúa

---

## 🔐 Almacenamiento

Los números bloqueados se guardan en:
```
backend/data/blocked-numbers.json
```

Este archivo persiste entre reinicios del bot.

---

## 🚀 Activación

El sistema de seguridad se activa automáticamente al iniciar el bot:

```powershell
node bot/whatsapp-bot.js
```

**Mensaje de inicio:**
```
⚖️ Bot JPS DESPACHO JURÍDICO - Iniciando...
🎓 LawyerPersonality inicializada
⚖️ CaseManager inicializado
⏰ Sistema de Recordatorios inicializado
📸 GoogleVisionMultaAnalyzer inicializado
🛡️ Sistema de Seguridad inicializado ← NUEVO
🚫 Cargados 0 números bloqueados
✅ Sistemas inicializados
```

---

## 💡 Ventajas

1. **Protección automática** - Sin intervención manual
2. **Prevención de suplantación** - Se identifica como bot
3. **Detección inteligente** - Analiza patrones de extorsión
4. **Bloqueo progresivo** - 3 oportunidades antes de bloquear
5. **Notificaciones** - Dueño siempre informado
6. **Gestión manual** - Comandos para bloquear/desbloquear

---

## ⚠️ Limitaciones

- **Falsos positivos:** Mensajes legítimos con urgencia pueden ser detectados
- **Idioma:** Solo detecta palabras en español
- **Evasión:** Delincuentes sofisticados pueden evitar palabras clave

**Recomendación:** Siempre revisar las notificaciones antes de tomar acción.

---

## 📱 Contacto Real

Si un usuario necesita atención genuina:

**JPS Despacho Jurídico**
📞 +52 477 724 4259
📍 León, Guanajuato

---

**Sistema diseñado para proteger a tus clientes y tu reputación. 🛡️**
