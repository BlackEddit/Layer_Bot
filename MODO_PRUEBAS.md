# 🧪 MODO PRUEBAS - Guía Rápida

## ¿Qué es el Modo Pruebas?

Un modo especial donde el bot **SOLO responde a números autorizados**. Perfecto para:
- ✅ Probar nuevas funcionalidades sin molestar a clientes
- ✅ Hacer demos con números específicos
- ✅ Desarrollo y testing
- ✅ Evitar que alguien más use el bot mientras pruebas

---

## 🚀 Activar Modo Pruebas

### Paso 1: Copiar archivo de configuración
```powershell
Copy-Item .config.local.example .config.local
```

### Paso 2: Editar `.config.local`
```
TEST_MODE=true
ALLOWED_NUMBERS=5214777244259,5214771234567
```

**Importante:**
- Sin espacios
- Sin el símbolo `+`
- Sin `@c.us`
- Separar números con comas
- Formato: país + área + número

### Paso 3: Reiniciar el bot
```powershell
node bot/whatsapp-bot.js
```

Verás este mensaje:
```
✅ Sistemas inicializados
🧪 MODO PRUEBAS ACTIVO - Solo 2 números permitidos
```

---

## 🌐 Desactivar Modo Pruebas (Producción)

Edita `.config.local`:
```
TEST_MODE=false
```

Reinicia el bot. Ahora responderá a **todos** los números.

---

## 📱 Verificar Estado

Desde tu número (dueño), envía:
```
!seguridad
```

Respuesta si está activo:
```
🛡️ REPORTE DE SEGURIDAD

🧪 MODO PRUEBAS: ACTIVO
✅ Números permitidos: 2

🚫 Números bloqueados: 0
⚠️ Números sospechosos: 0
```

Respuesta si está desactivado:
```
🛡️ REPORTE DE SEGURIDAD

🌐 MODO: PRODUCCIÓN
✅ Respondiendo a todos los números

🚫 Números bloqueados: 0
⚠️ Números sospechosos: 0
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Probar solo con tu número
```
TEST_MODE=true
ALLOWED_NUMBERS=5214777244259
```

### Ejemplo 2: Probar con 3 números
```
TEST_MODE=true
ALLOWED_NUMBERS=5214777244259,5214771234567,5211234567890
```

### Ejemplo 3: Producción (todos)
```
TEST_MODE=false
ALLOWED_NUMBERS=
```

---

## 🔒 Seguridad

El archivo `.config.local`:
- ✅ NO se sube a GitHub (está en `.gitignore`)
- ✅ Nombre discreto (no delata que es importante)
- ✅ Formato simple (fácil de editar)
- ✅ Separado de `.env` (más seguro)

---

## ⚠️ Importante

1. **NO borres `.config.local.example`** - Es la plantilla
2. **SI borra `.config.local`** - Contiene tus números de prueba
3. El bot funciona sin `.config.local` (modo producción por defecto)
4. Los números bloqueados se ignoran **siempre** (incluso en modo pruebas)

---

## 🎯 Casos de Uso

### Desarrollo
```
TEST_MODE=true
ALLOWED_NUMBERS=5214777244259  # Solo tu número
```

### Demo con Cliente
```
TEST_MODE=true
ALLOWED_NUMBERS=5214777244259,5214771234567  # Tú + cliente
```

### Testing con Equipo
```
TEST_MODE=true
ALLOWED_NUMBERS=5214777244259,5214771111111,5214772222222  # Tú + 2 developers
```

### Producción
```
TEST_MODE=false
# Bot responde a todos
```

---

## 🛠️ Troubleshooting

### "El bot no responde a mi número de prueba"

1. Verifica formato:
   ```
   ✅ Correcto: 5214777244259
   ❌ Incorrecto: +52 477 724 4259
   ❌ Incorrecto: 5214777244259@c.us
   ```

2. Verifica que no haya espacios:
   ```
   ✅ Correcto: ALLOWED_NUMBERS=5214777244259,5214771234567
   ❌ Incorrecto: ALLOWED_NUMBERS=5214777244259, 5214771234567
   ```

3. Reinicia el bot después de cambiar `.config.local`

---

### "Agregué un número pero no funciona"

Reinicia el bot. Los cambios en `.config.local` **solo** se cargan al iniciar.

---

### "¿Cómo sé qué números están permitidos?"

Envía `!seguridad` desde tu número de dueño.

---

## 📊 Logs

Cuando está en modo pruebas, verás:

```
📩 Mensaje recibido: Hola
👤 De: 5214779999999@c.us
🧪 Modo pruebas activo - Número no autorizado: 5214779999999@c.us
```

Ese número NO recibirá respuesta (pero lo verás en logs).

---

**Ahora puedes probar el bot sin molestar a nadie. 🧪**
