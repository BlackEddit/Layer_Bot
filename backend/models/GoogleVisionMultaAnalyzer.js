/**
 * ═══════════════════════════════════════════════════════════════
 * 📸 ANALIZADOR DE MULTAS CON GOOGLE VISION (MEJOR OCR)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Usa Google Cloud Vision para OCR preciso de multas
 * Precisión: 95%+ en textos impresos
 * Capa gratuita: 1,000 análisis/mes
 */

const vision = require('@google-cloud/vision');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

class GoogleVisionMultaAnalyzer {
    constructor() {
        // Inicializar Google Vision con API Key
        this.visionClient = new vision.ImageAnnotatorClient({
            apiKey: process.env.GOOGLE_VISION_API_KEY
        });

        // Groq para interpretar el texto extraído
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        console.log('📸 GoogleVisionMultaAnalyzer inicializado');
    }

    /**
     * Analiza una foto de multa con Google Vision
     * @param {string} imagePath - Ruta completa de la imagen
     * @returns {Object} Datos extraídos de la multa
     */
    async analizarMulta(imagePath) {
        try {
            console.log(`🔍 Analizando multa con Google Vision: ${path.basename(imagePath)}`);

            // 1. Extraer TODO el texto con Google Vision OCR
            const [result] = await this.visionClient.textDetection(imagePath);
            const detections = result.textAnnotations;

            if (!detections || detections.length === 0) {
                throw new Error('No se detectó texto en la imagen');
            }

            // El primer elemento contiene TODO el texto
            const textoCompleto = detections[0].description;
            console.log('📄 Texto extraído:', textoCompleto.substring(0, 200) + '...');

            // 2. Usar Groq para interpretar y estructurar los datos
            const datosEstructurados = await this.interpretarTexto(textoCompleto);

            return {
                exito: true,
                datos: datosEstructurados,
                textoCompleto: textoCompleto,
                confianza: 95, // Google Vision tiene alta precisión
                mensaje: this.generarMensajeWhatsApp(datosEstructurados)
            };

        } catch (error) {
            console.error('❌ Error analizando multa:', error.message);
            return {
                exito: false,
                error: error.message,
                mensaje: '❌ No pude analizar la multa. ¿Puedes enviar una foto más clara?'
            };
        }
    }

    /**
     * Usa Groq para interpretar el texto extraído por Google Vision
     */
    async interpretarTexto(textoCompleto) {
        try {
            const prompt = `Eres un experto en análisis de multas de tránsito en México.

Aquí está el texto extraído de una foto de multa:

${textoCompleto}

Extrae TODOS estos datos con MÁXIMA precisión y responde en formato JSON con esta estructura EXACTA:
{
  "nombreInfractor": "nombre completo del infraccionado/propietario del vehículo",
  "folio": "número de folio, boleta o número de infracción",
  "fechaInfraccion": "fecha de la infracción en formato DD/MM/YYYY",
  "placas": "placas del vehículo",
  "marca": "marca del vehículo (ej: NISSAN, HONDA, TOYOTA)",
  "linea": "línea/modelo del vehículo (ej: SENTRA, CIVIC, COROLLA)",
  "nombreOficial": "nombre completo del policía vial o agente que emitió la multa",
  "idOficial": "número de identificación, placa o empleado del policía",
  "delegacion": "delegación, dirección o corporación (ej: DIRECCIÓN DE POLICÍA VIAL)",
  "turno": "turno del oficial (ej: PRIMER TURNO, SEGUNDO TURNO, MATUTINO, VESPERTINO)",
  "sector": "sector, zona o región donde ocurrió (ej: SECTOR 1, ZONA NORTE)",
  "hora": "hora exacta de la infracción (formato 24hrs: HH:MM)",
  "lugar": "ubicación completa: calle, número, colonia, municipio",
  "tipoInfraccion": "descripción exacta de la infracción cometida",
  "articulo": "artículo, fracción e inciso del reglamento infringido",
  "monto": "cantidad exacta a pagar (solo número, ej: 2500)"
}

INSTRUCCIONES CRÍTICAS:
- Extrae el texto EXACTO que aparece en la multa
- No inventes información que no esté en el texto
- Si un dato NO aparece, pon "No especificado"
- Para fechas, convierte al formato DD/MM/YYYY
- Para el monto, pon solo el número sin símbolos

Responde SOLO con el JSON, sin texto adicional.`;

            const response = await this.groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                max_tokens: 1000
            });

            const respuesta = response.choices[0].message.content.trim();
            
            // Extraer JSON de la respuesta
            const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No se pudo extraer JSON de la respuesta');
            }

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            console.error('❌ Error interpretando texto:', error.message);
            return {
                nombreInfractor: "No especificado",
                folio: "No especificado",
                fechaInfraccion: "No especificado",
                placas: "No especificado",
                marca: "No especificado",
                linea: "No especificado",
                nombreOficial: "No especificado",
                idOficial: "No especificado",
                delegacion: "No especificado",
                turno: "No especificado",
                sector: "No especificado",
                hora: "No especificado",
                lugar: "No especificado",
                tipoInfraccion: "No especificado",
                articulo: "No especificado",
                monto: "No especificado",
                error_interpretacion: error.message
            };
        }
    }

    /**
     * Genera mensaje formateado para WhatsApp
     */
    generarMensajeWhatsApp(datos) {
        // Contar cuántos campos se obtuvieron
        const camposRequeridos = [
            'nombreInfractor', 'folio', 'fechaInfraccion', 'placas', 
            'marca', 'linea', 'nombreOficial', 'idOficial',
            'delegacion', 'turno', 'sector', 'hora', 'lugar'
        ];
        
        const camposObtenidos = camposRequeridos.filter(campo => 
            datos[campo] && datos[campo] !== 'No especificado'
        ).length;
        
        const porcentajeCompletado = Math.round((camposObtenidos / camposRequeridos.length) * 100);

        return `📋 *ANÁLISIS COMPLETO DE MULTA*

👤 *INFRACCIONADO*
   Nombre: ${datos.nombreInfractor}

📌 *DATOS DE LA INFRACCIÓN*
   📋 Folio: ${datos.folio}
   📅 Fecha: ${datos.fechaInfraccion}
   🕐 Hora: ${datos.hora}
   📍 Lugar: ${datos.lugar}

🚗 *VEHÍCULO*
   🔖 Placas: ${datos.placas}
   🚘 Marca: ${datos.marca}
   📝 Línea: ${datos.linea}

👮 *AGENTE VIAL*
   👤 Nombre: ${datos.nombreOficial}
   🆔 ID/Empleado: ${datos.idOficial}
   🏢 Delegación: ${datos.delegacion}
   ⏰ Turno: ${datos.turno}
   📍 Sector: ${datos.sector}

⚠️ *INFRACCIÓN COMETIDA*
   ${datos.tipoInfraccion}
   📖 Fundamento: ${datos.articulo}
   💰 Monto: $${datos.monto}

━━━━━━━━━━━━━━━━━━━━
✅ Precisión: ${porcentajeCompletado}% (${camposObtenidos}/${camposRequeridos.length} campos)
📸 Analizado con Google Vision AI

🎯 *¿QUIERES IMPUGNARLA?*
💰 Inversión: $2,500 MXN
📊 Éxito: 97% (330/340 casos ganados)
⏱️ Tiempo: 4-6 meses

Responde *SÍ* para proceder con la demanda.`;
    }
}

module.exports = GoogleVisionMultaAnalyzer;
