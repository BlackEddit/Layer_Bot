# 🔧 CONFIGURACIÓN GOOGLE VISION API

## ⚡ Paso a Paso (5 minutos)

### 1️⃣ Crear cuenta en Google Cloud
1. Ve a: https://console.cloud.google.com/
2. Crea una cuenta (necesitas Gmail)
3. **Sí necesitas tarjeta para verificar**, PERO:
   - 1,000 análisis GRATIS por mes
   - Solo cobran si pasas ese límite
   - Puedes poner límite de gasto en $0

### 2️⃣ Crear proyecto
```
1. Click en "Select a project" arriba
2. Click "NEW PROJECT"
3. Nombre: "BotAbogado-Multas"
4. Click "CREATE"
```

### 3️⃣ Activar Vision API
```
1. En el buscador arriba escribe: "Vision API"
2. Click en "Cloud Vision API"
3. Click "ENABLE"
4. Espera 30 segundos
```

### 4️⃣ Crear credenciales (Service Account)
```
1. Ve a: APIs & Services > Credentials
2. Click "CREATE CREDENTIALS" > "Service Account"
3. Nombre: "bot-multas"
4. Click "CREATE AND CONTINUE"
5. Role: "Basic" > "Owner" (o "Cloud Vision AI User")
6. Click "DONE"
```

### 5️⃣ Descargar JSON de credenciales
```
1. En la lista de Service Accounts, click en "bot-multas@..."
2. Pestaña "KEYS"
3. Click "ADD KEY" > "Create new key"
4. Tipo: JSON
5. Click "CREATE"
6. Se descarga un archivo .json
```

### 6️⃣ Guardar credenciales en tu proyecto
```powershell
# Crear carpeta para credenciales
mkdir d:\Proyectos\BotAbogado\config

# Mover el archivo descargado (ajusta el nombre)
Move-Item "$env:USERPROFILE\Downloads\botabogado-multas-*.json" "d:\Proyectos\BotAbogado\config\google-vision-credentials.json"
```

### 7️⃣ Configurar variable de entorno
Agrega esta línea a tu archivo `.env`:

```env
GOOGLE_APPLICATION_CREDENTIALS=./config/google-vision-credentials.json
```

### 8️⃣ PROBAR
```powershell
node test-google-vision.js "storage/images/received/WhatsApp Image 2026-01-02 at 3.33.52 PM.jpeg"
```

---

## 🎯 Si quieres LIMITAR el gasto

1. Ve a: https://console.cloud.google.com/billing
2. Click en tu cuenta de facturación
3. "Budgets & alerts"
4. "CREATE BUDGET"
5. Pon límite de $0.00 USD
6. Activa alertas al 50%, 90%, 100%

Así te avisan si te vas a pasar del límite gratuito.

---

## 📊 Uso gratuito de Vision API

- **1,000 análisis/mes GRATIS**
- Después: $1.50 USD por cada 1,000 análisis
- Si analizas 10 multas/día = 300/mes = **100% GRATIS**

---

## ❓ Troubleshooting

### Error: "Could not load the default credentials"
```powershell
# Verifica que existe el archivo
Test-Path "./config/google-vision-credentials.json"

# Verifica la variable en .env
Get-Content .env | Select-String "GOOGLE_APPLICATION_CREDENTIALS"
```

### Error: "API has not been used in project"
```
Espera 1-2 minutos después de activar la API
```

### Error: "Permission denied"
```
Verifica que el Service Account tenga role "Owner" o "Cloud Vision AI User"
```

---

## 🚀 ¿Todo listo?

Una vez configurado, ejecuta:

```powershell
node test-google-vision.js "storage/images/received/WhatsApp Image 2026-01-02 at 3.33.52 PM.jpeg"
```

Deberías ver:
- ✅ Texto extraído de la imagen
- ✅ Datos estructurados (folio, fecha, monto, etc.)
- ✅ 95% de confianza
