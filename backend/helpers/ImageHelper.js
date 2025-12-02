const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const { IMAGES, CAPTIONS, KEYWORD_IMAGE_MAP } = require('../config/imageConfig');

/**
 * HELPER PARA ENVIAR IMÁGENES DEL DESPACHO
 * 
 * Facilita el envío de imágenes de marketing en cualquier parte del bot
 */

class ImageHelper {
    constructor(client) {
        this.client = client;
    }

    /**
     * Envía una imagen con su caption predefinido
     * @param {string} recipient - Número de WhatsApp del destinatario
     * @param {string} imageKey - Clave de la imagen (ej: 'BIENVENIDA', 'IMPUGNACION_MULTAS')
     * @param {string} customCaption - Caption personalizado (opcional)
     * @returns {Promise<boolean>} - True si se envió, false si no existe la imagen
     */
    async sendImage(recipient, imageKey, customCaption = null) {
        try {
            const imagePath = IMAGES[imageKey];
            
            if (!imagePath) {
                console.error(`❌ Imagen no encontrada: ${imageKey}`);
                return false;
            }

            // Verificar si el archivo existe
            if (!fs.existsSync(imagePath)) {
                console.warn(`⚠️ Archivo de imagen no existe: ${imagePath}`);
                return false;
            }

            // Cargar imagen
            const media = MessageMedia.fromFilePath(imagePath);
            
            // Usar caption personalizado o el predefinido
            const caption = customCaption || CAPTIONS[imageKey] || '';

            // Enviar imagen
            await this.client.sendMessage(recipient, media, { caption });
            
            console.log(`📸 Imagen enviada: ${imageKey} → ${recipient}`);
            return true;

        } catch (error) {
            console.error(`❌ Error enviando imagen ${imageKey}:`, error);
            return false;
        }
    }

    /**
     * Envía imagen basada en palabras clave del mensaje
     * @param {string} recipient - Número de WhatsApp
     * @param {string} message - Mensaje del usuario
     * @returns {Promise<boolean>} - True si encontró y envió imagen relevante
     */
    async sendRelevantImage(recipient, message) {
        const lowerMessage = message.toLowerCase();
        
        // Buscar coincidencia de palabra clave
        for (const [keyword, imageKey] of Object.entries(KEYWORD_IMAGE_MAP)) {
            if (lowerMessage.includes(keyword)) {
                console.log(`🔍 Palabra clave detectada: "${keyword}" → ${imageKey}`);
                return await this.sendImage(recipient, imageKey);
            }
        }
        
        return false;
    }

    /**
     * Envía imagen de bienvenida (primera conversación)
     */
    async sendWelcomeImage(recipient) {
        return await this.sendImage(recipient, 'BIENVENIDA');
    }

    /**
     * Envía ejemplo de multa cancelada (después de recibir foto)
     */
    async sendSuccessExample(recipient) {
        return await this.sendImage(recipient, 'MULTA_CANCELADA');
    }

    /**
     * Envía estadísticas del despacho (para generar confianza)
     */
    async sendStats(recipient) {
        return await this.sendImage(recipient, 'ESTADISTICAS');
    }

    /**
     * Envía tarjeta de contacto
     */
    async sendContactCard(recipient) {
        return await this.sendImage(recipient, 'CONTACTO');
    }

    /**
     * Envía información de precios
     */
    async sendPricing(recipient) {
        return await this.sendImage(recipient, 'PRECIOS');
    }

    /**
     * Envía imagen de impugnación de multas (servicio core)
     */
    async sendFineImpugnation(recipient) {
        return await this.sendImage(recipient, 'IMPUGNACION_MULTAS');
    }

    /**
     * Envía múltiples imágenes con delay
     * @param {string} recipient - Número de WhatsApp
     * @param {Array<string>} imageKeys - Array de claves de imágenes
     * @param {number} delay - Milisegundos entre cada imagen (default: 2000)
     */
    async sendMultipleImages(recipient, imageKeys, delay = 2000) {
        for (const imageKey of imageKeys) {
            await this.sendImage(recipient, imageKey);
            
            // Esperar antes de enviar la siguiente
            if (imageKeys.indexOf(imageKey) < imageKeys.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * Verifica qué imágenes están disponibles
     * @returns {Object} - Lista de imágenes disponibles y faltantes
     */
    checkAvailableImages() {
        const available = [];
        const missing = [];

        for (const [key, path] of Object.entries(IMAGES)) {
            if (fs.existsSync(path)) {
                available.push(key);
            } else {
                missing.push({ key, path });
            }
        }

        return { available, missing };
    }

    /**
     * Lista todas las imágenes disponibles en consola
     */
    listAvailableImages() {
        const { available, missing } = this.checkAvailableImages();
        
        console.log('\n📸 IMÁGENES DISPONIBLES:');
        available.forEach(img => console.log(`  ✅ ${img}`));
        
        if (missing.length > 0) {
            console.log('\n⚠️ IMÁGENES FALTANTES:');
            missing.forEach(({ key, path }) => {
                console.log(`  ❌ ${key}`);
                console.log(`     ${path}`);
            });
        }
        
        console.log(`\nTotal: ${available.length}/${Object.keys(IMAGES).length} disponibles\n`);
    }
}

module.exports = ImageHelper;
