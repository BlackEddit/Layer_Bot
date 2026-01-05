/**
 * ═══════════════════════════════════════════════════════════════
 * 📸 ANALIZADOR DE FOTOS DE MULTAS CON GROQ VISION
 * ═══════════════════════════════════════════════════════════════
 * 
 * Extrae información de fotos de multas usando IA
 * Usa tu API key de Groq (que ya tienes configurada)
 */

const Groq = require("groq-sdk");
const fs = require('fs');
const path = require('path');

class MultaAnalyzer {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        console.log('📸 MultaAnalyzer inicializado');
    }

    /**
     * Analiza una foto de multa y extrae datos estructurados
     * @param {string} imagePath - Ruta completa de la imagen
     * @returns {Object} Datos extraídos de la multa
     */
    async analizarMulta(imagePath) {
        try {
            console.log(`🔍 Analizando multa: ${path.basename(imagePath)}`);
            
            // Leer imagen y convertir a base64
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = this.getMimeType(imagePath);
            
            // Llamar a Groq Vision con llama-3.2-11b-vision-preview (modelo actualizado)
            const response = await this.groq.chat.completions.create({
                model: "llama-3.2-11b-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Eres un experto en análisis de multas de tránsito en México.

Analiza esta foto de multa y extrae TODA la información visible.

RESPONDE EN FORMATO JSON con esta estructura EXACTA:
{
  "folio": "número de folio o boleta",
  "fecha": "fecha de la infracción",
  "hora": "hora de la infracción",
  "lugar": "calle, colonia, municipio",
  "placas": "placas del vehículo",
  "tipo_infraccion": "descripción de la infracción",
  "articulo": "artículo o fundamento legal",
  "monto": "cantidad a pagar en pesos",
  "autoridad": "nombre de la autoridad",
  "oficial": "nombre del oficial (si aparece)",
  "vigencia": "fecha límite de pago",
  "observaciones": "cualquier nota adicional importante",
  "datos_completos": true o false (si faltan datos importantes)
}

Si algún dato NO es visible, pon "No visible" en ese campo.
IMPORTANTE: Responde SOLO el JSON, sin texto adicional.`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.1, // Muy bajo para que sea preciso
                max_tokens: 1000
            });

            const resultadoTexto = response.choices[0]?.message?.content || '{}';
            
            // Limpiar respuesta (a veces viene con texto extra)
            let jsonTexto = resultadoTexto.trim();
            
            // Buscar el JSON en la respuesta
            const jsonMatch = jsonTexto.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonTexto = jsonMatch[0];
            }
            
            const datos = JSON.parse(jsonTexto);
            
            console.log('✅ Multa analizada exitosamente');
            console.log('📋 Datos extraídos:', JSON.stringify(datos, null, 2));
            
            return {
                success: true,
                datos: datos,
                imagePath: imagePath
            };
            
        } catch (error) {
            console.error('❌ Error analizando multa:', error.message);
            return {
                success: false,
                error: error.message,
                imagePath: imagePath
            };
        }
    }

    /**
     * Genera un resumen legible de la multa analizada
     */
    generarResumen(datosMulta) {
        if (!datosMulta.success) {
            return `❌ No pude analizar la foto de la multa.\n\nError: ${datosMulta.error}`;
        }

        const d = datosMulta.datos;
        
        let resumen = `📋 *ANÁLISIS DE MULTA COMPLETADO*\n\n`;
        
        // Datos principales
        if (d.folio && d.folio !== "No visible") {
            resumen += `📄 *Folio:* ${d.folio}\n`;
        }
        
        if (d.fecha && d.fecha !== "No visible") {
            resumen += `📅 *Fecha:* ${d.fecha}\n`;
        }
        
        if (d.hora && d.hora !== "No visible") {
            resumen += `🕐 *Hora:* ${d.hora}\n`;
        }
        
        if (d.lugar && d.lugar !== "No visible") {
            resumen += `📍 *Lugar:* ${d.lugar}\n`;
        }
        
        resumen += `\n`;
        
        // Vehículo e infracción
        if (d.placas && d.placas !== "No visible") {
            resumen += `🚗 *Placas:* ${d.placas}\n`;
        }
        
        if (d.tipo_infraccion && d.tipo_infraccion !== "No visible") {
            resumen += `⚠️ *Infracción:* ${d.tipo_infraccion}\n`;
        }
        
        if (d.articulo && d.articulo !== "No visible") {
            resumen += `📜 *Artículo:* ${d.articulo}\n`;
        }
        
        resumen += `\n`;
        
        // Monto y vigencia
        if (d.monto && d.monto !== "No visible") {
            resumen += `💰 *Monto:* $${d.monto}\n`;
        }
        
        if (d.vigencia && d.vigencia !== "No visible") {
            resumen += `⏰ *Vigencia:* ${d.vigencia}\n`;
        }
        
        resumen += `\n`;
        
        // Autoridad
        if (d.autoridad && d.autoridad !== "No visible") {
            resumen += `👮 *Autoridad:* ${d.autoridad}\n`;
        }
        
        if (d.observaciones && d.observaciones !== "No visible") {
            resumen += `\n📝 *Observaciones:*\n${d.observaciones}\n`;
        }
        
        resumen += `\n━━━━━━━━━━━━━━━━━━\n\n`;
        
        // Análisis de viabilidad
        if (d.datos_completos === false) {
            resumen += `⚠️ *ATENCIÓN:* Faltan datos en la multa. Esto puede facilitar la impugnación.\n\n`;
        }
        
        resumen += `✅ *El Lic. José Patricio revisará tu caso*\n\n`;
        resumen += `💰 *Inversión impugnación:* $2,500 MXN\n`;
        resumen += `📊 *Tasa de éxito:* 97% (330/340 ganados)\n\n`;
        resumen += `¿Deseas proceder con la impugnación?`;
        
        return resumen;
    }

    /**
     * Detecta el tipo MIME de la imagen
     */
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        return mimeTypes[ext] || 'image/jpeg';
    }

    /**
     * Verifica si una multa tiene errores que facilitan la impugnación
     */
    detectarErrores(datosMulta) {
        const errores = [];
        const d = datosMulta.datos;

        if (!d.folio || d.folio === "No visible") {
            errores.push("Sin número de folio visible");
        }
        
        if (!d.fecha || d.fecha === "No visible") {
            errores.push("Sin fecha visible");
        }
        
        if (!d.hora || d.hora === "No visible") {
            errores.push("Sin hora visible");
        }
        
        if (!d.lugar || d.lugar === "No visible") {
            errores.push("Sin lugar específico");
        }
        
        if (!d.oficial || d.oficial === "No visible") {
            errores.push("Sin nombre del oficial");
        }
        
        if (!d.articulo || d.articulo === "No visible") {
            errores.push("Sin fundamento legal claro");
        }

        return errores;
    }
}

module.exports = MultaAnalyzer;
