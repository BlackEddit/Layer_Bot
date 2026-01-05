# 🧪 CÓMO PROBAR EL ANALIZADOR DE MULTAS

## 📋 PASOS PARA PROBAR SIN WHATSAPP:

### 1️⃣ **Consigue una foto de multa**

Opciones:
- Toma foto de una multa real
- Busca en Google "multa de tránsito México ejemplo" y descarga una
- Usa la que te mandaron por WhatsApp

Guárdala en: `storage/images/received/multa-test.jpg`

---

### 2️⃣ **Ejecuta el script de prueba**

```powershell
node test-multa-analyzer.js storage/images/received/multa-test.jpg
```

---

### 3️⃣ **Ver resultados**

El script te mostrará:

```
═══════════════════════════════════════════════════════
📊 RESULTADO DEL ANÁLISIS
═══════════════════════════════════════════════════════

✅ ANÁLISIS EXITOSO

📋 DATOS EXTRAÍDOS:
─────────────────────────────────────────────────────
  📄 Folio:        MTT-2024-123456
  📅 Fecha:        15/12/2024
  🕐 Hora:         14:30
  🚗 Placas:       ABC-123-D
  📍 Lugar:        AV. INSURGENTES COL. ROMA
  ⚠️  Infracción:  EXCESO DE VELOCIDAD
  💰 Monto:        $1,500 MXN
  👮 Autoridad:    DIRECCIÓN DE TRÁNSITO

📊 CONFIANZA DEL ANÁLISIS:
─────────────────────────────────────────────────────
  87%

✅ Confianza alta. Datos probablemente correctos.
```

---

## 🎯 **QUÉ HACE EL ANALIZADOR:**

### **Groq Vision detecta:**
- ✅ Número de folio
- ✅ Fecha y hora de infracción
- ✅ Placas del vehículo
- ✅ Lugar (calle, colonia)
- ✅ Tipo de infracción
- ✅ Monto a pagar
- ✅ Autoridad emisora

### **Ventajas de Groq:**
- 🆓 Completamente GRATIS
- ⚡ Rápido (2-3 segundos)
- 🧠 Entiende contexto (no solo texto)
- 🔒 No necesita tarjeta de crédito
- 📱 Ya tienes la API key configurada

---

## 🔧 **SI QUIERES USAR GOOGLE VISION (Más preciso):**

### Paso 1: Crear proyecto en Google Cloud
1. Ve a: https://console.cloud.google.com
2. Crea un proyecto nuevo
3. Habilita "Cloud Vision API"
4. Crea credenciales (Service Account)
5. Descarga el JSON

### Paso 2: Guardar credenciales
Guarda el archivo JSON como: `google-credentials.json` en la raíz del proyecto

### Paso 3: Instalar dependencia
```powershell
npm install @google-cloud/vision
```

### Paso 4: Cambiar en .env
```env
VISION_PROVIDER=google  # Cambiar de "groq" a "google"
```

---

## 📸 **EJEMPLOS DE FOTOS DE MULTAS:**

### ✅ **Foto BUENA:**
- Imagen clara y enfocada
- Luz suficiente (no muy oscura)
- Texto legible
- Sin reflejos
- Orientación correcta

### ❌ **Foto MALA:**
- Borrosa
- Muy oscura
- Con reflejos en el papel
- Texto ilegible
- Foto de lejos

---

## 🚀 **PROBAR AHORA:**

```powershell
# 1. Copia una foto de multa a:
copy "C:\tu-foto-multa.jpg" "storage\images\received\multa-test.jpg"

# 2. Analízala:
node test-multa-analyzer.js storage/images/received/multa-test.jpg
```

---

## ⚙️ **INTEGRACIÓN CON WHATSAPP:**

Una vez que funcione el análisis, el bot automáticamente:

1. Cliente envía foto de multa por WhatsApp
2. Bot la guarda en `storage/images/received/`
3. **Analiza automáticamente** con Groq Vision
4. Extrae todos los datos
5. Responde con:
   ```
   📸 MULTA RECIBIDA - ANÁLISIS COMPLETO
   
   📋 Folio: MTT-2024-123456
   📅 Fecha: 15/12/2024
   🚗 Placas: ABC-123-D
   💰 Monto: $1,500 MXN
   
   ✅ El Lic. José Patricio revisará tu caso
   💰 Inversión impugnación: $2,500 MXN
   📊 Tasa de éxito: 97%
   ```

Ya está todo integrado, solo necesitas probarlo primero sin WhatsApp.

---

**¿Tienes una foto de multa lista para probar?**
