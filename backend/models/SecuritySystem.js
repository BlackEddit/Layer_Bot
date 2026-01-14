/**
 * ═══════════════════════════════════════════════════════════════
 * 🛡️ SISTEMA DE SEGURIDAD ANTI-EXTORSIÓN
 * ═══════════════════════════════════════════════════════════════
 * 
 * Protección contra extorsiones, secuestros virtuales y fraudes
 */

const fs = require('fs');
const path = require('path');

class SecuritySystem {
    constructor() {
        this.blockedNumbers = new Set();
        this.suspiciousNumbers = new Map(); // número -> {count, lastWarning}
        this.allowedNumbers = new Set(); // Lista blanca para modo pruebas
        this.testMode = false; // Modo pruebas activado/desactivado
        
        this.blockedFilePath = path.join(__dirname, '../data/blocked-numbers.json');
        this.testConfigPath = path.join(__dirname, '../../.config.local');
        
        // Palabras clave de extorsión (detectar intentos de fraude)
        this.extorsionKeywords = [
            // Secuestro virtual
            'secuestrado', 'secuestre', 'retenido', 'hospital', 'accidente grave',
            'ambulancia', 'emergencia familiar', 'algo le paso', 'tuvo un accidente',
            
            // Amenazas
            'amenaza', 'matar', 'lastimar', 'hacer daño', 'te vamos a', 
            'cartel', 'narco', 'sicario', 'tenemos gente', 'sabemos donde vives',
            
            // Extorsión directa
            'deposita', 'transfiere', 'manda dinero', 'necesito dinero urgente',
            'tarjeta prepagada', 'oxxo', 'western union', 'bitcoins',
            
            // Suplantación de autoridad
            'fiscal', 'ministerio publico', 'orden de aprehension', 'demanda',
            'juzgado', 'tribunal', 'multa pendiente', 'adeudo',
            
            // Urgencia extrema
            'es urgente', 'inmediatamente', 'ahora mismo', 'rapido', 'no tengo tiempo',
            'antes de que', 'si no', 'o sino'
        ];
        
        this.loadBlockedNumbers();
        this.loadTestConfig();
        console.log('🛡️ Sistema de Seguridad inicializado');
        
        if (this.testMode) {
            console.log(`🧪 MODO PRUEBAS ACTIVO - Solo ${this.allowedNumbers.size} números permitidos`);
        }
    }

    /**
     * Cargar configuración de modo pruebas desde archivo discreto
     */
    loadTestConfig() {
        try {
            if (fs.existsSync(this.testConfigPath)) {
                const configContent = fs.readFileSync(this.testConfigPath, 'utf8');
                const lines = configContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                
                for (const line of lines) {
                    const [key, value] = line.split('=').map(s => s.trim());
                    
                    if (key === 'TEST_MODE') {
                        this.testMode = value.toLowerCase() === 'true';
                    } else if (key === 'ALLOWED_NUMBERS') {
                        // Formato: ALLOWED_NUMBERS=5214771234567,5214779876543
                        const numbers = value.split(',').map(n => n.trim());
                        numbers.forEach(num => {
                            if (num) {
                                this.allowedNumbers.add(num + '@c.us');
                            }
                        });
                    }
                }
                
                console.log(`📋 Configuración de pruebas cargada: ${this.allowedNumbers.size} números`);
            }
        } catch (error) {
            console.error('❌ Error cargando configuración de pruebas:', error.message);
        }
    }

    /**
     * Cargar lista de números bloqueados desde archivo
     */
    loadBlockedNumbers() {
        try {
            if (fs.existsSync(this.blockedFilePath)) {
                const data = fs.readFileSync(this.blockedFilePath, 'utf8');
                const blocked = JSON.parse(data);
                this.blockedNumbers = new Set(blocked);
                console.log(`🚫 Cargados ${this.blockedNumbers.size} números bloqueados`);
            }
        } catch (error) {
            console.error('❌ Error cargando números bloqueados:', error.message);
        }
    }

    /**
     * Guardar lista de números bloqueados
     */
    saveBlockedNumbers() {
        try {
            const dir = path.dirname(this.blockedFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            const blocked = Array.from(this.blockedNumbers);
            fs.writeFileSync(this.blockedFilePath, JSON.stringify(blocked, null, 2));
            console.log(`💾 Guardados ${blocked.length} números bloqueados`);
        } catch (error) {
            console.error('❌ Error guardando números bloqueados:', error.message);
        }
    }

    /**
     * Verificar si un mensaje contiene señales de extorsión
     */
    detectExtorsion(messageBody) {
        if (!messageBody) return { isExtorsion: false, keywords: [] };

        const bodyLower = messageBody.toLowerCase();
        const foundKeywords = [];

        for (const keyword of this.extorsionKeywords) {
            if (bodyLower.includes(keyword)) {
                foundKeywords.push(keyword);
            }
        }

        // Si encuentra 2 o más palabras clave, es alta sospecha
        const isExtorsion = foundKeywords.length >= 2;

        return { isExtorsion, keywords: foundKeywords, severity: foundKeywords.length };
    }

    /**
     * Verificar si un número está bloqueado
     */
    isBlocked(phoneNumber) {
        return this.blockedNumbers.has(phoneNumber);
    }

    /**
     * Verificar si un número está permitido en modo pruebas
     */
    isAllowed(phoneNumber) {
        // Si no está en modo pruebas, todos están permitidos
        if (!this.testMode) {
            return true;
        }
        
        // En modo pruebas, solo números de la lista blanca
        return this.allowedNumbers.has(phoneNumber);
    }

    /**
     * Verificar si debe responder al número
     * Combina bloqueo y modo pruebas
     */
    shouldRespond(phoneNumber) {
        // Siempre ignorar bloqueados
        if (this.isBlocked(phoneNumber)) {
            return false;
        }
        
        // En modo pruebas, solo responder a permitidos
        if (this.testMode && !this.isAllowed(phoneNumber)) {
            return false;
        }
        
        return true;
    }

    /**
     * Bloquear un número
     */
    blockNumber(phoneNumber, reason = 'Manual') {
        this.blockedNumbers.add(phoneNumber);
        this.saveBlockedNumbers();
        console.log(`🚫 Número bloqueado: ${phoneNumber} (Razón: ${reason})`);
    }

    /**
     * Desbloquear un número
     */
    unblockNumber(phoneNumber) {
        const wasBlocked = this.blockedNumbers.delete(phoneNumber);
        if (wasBlocked) {
            this.saveBlockedNumbers();
            console.log(`✅ Número desbloqueado: ${phoneNumber}`);
        }
        return wasBlocked;
    }

    /**
     * Marcar número como sospechoso
     */
    markSuspicious(phoneNumber) {
        const current = this.suspiciousNumbers.get(phoneNumber) || { count: 0, lastWarning: null };
        current.count++;
        current.lastWarning = new Date().toISOString();
        
        this.suspiciousNumbers.set(phoneNumber, current);

        // Si acumula 3 intentos sospechosos, bloquear automáticamente
        if (current.count >= 3) {
            this.blockNumber(phoneNumber, 'Auto-bloqueo por intentos de extorsión');
            return { blocked: true, count: current.count };
        }

        return { blocked: false, count: current.count };
    }

    /**
     * Generar mensaje de advertencia automático
     */
    getWarningMessage(severity) {
        if (severity >= 3) {
            return `🚨 *ADVERTENCIA DE SEGURIDAD*

Este mensaje ha sido identificado como un posible intento de *EXTORSIÓN o FRAUDE*.

⚠️ *NO proporciones información personal*
⚠️ *NO realices pagos*
⚠️ *NO compartas códigos o contraseñas*

🛡️ *RECOMENDACIONES:*
1. Ignora este mensaje
2. NO respondas
3. Bloquea este número
4. Reporta al 089 (Denuncia Anónima)

📱 Si necesitas asesoría legal real, contacta directamente a:
*JPS Despacho Jurídico*
📞 +52 477 724 4259

⚖️ Este es un sistema automatizado de protección.`;
        } else {
            return `⚠️ *AVISO DE SEGURIDAD*

Hemos detectado contenido sospechoso en tu mensaje.

Si realmente necesitas asesoría legal, contacta directamente:
📞 +52 477 724 4259

🤖 Este es un asistente automatizado de JPS Despacho Jurídico.`;
        }
    }

    /**
     * Mensaje de presentación automático (prevenir suplantación)
     */
    getAutoReplyMessage() {
        return `⚖️ *BIENVENIDO A JPS DESPACHO JURÍDICO*

Soy tu asistente virtual. En la siguiente imagen te presento nuestros servicios.

¿Hay algo en lo que te pueda ayudar?`;
    }

    /**
     * Verificar si es un número nuevo (primera vez que escribe)
     */
    isFirstContact(phoneNumber, conversationHistory) {
        // Verificar si hay historial previo
        return !conversationHistory || conversationHistory.length === 0;
    }

    /**
     * Obtener reporte de seguridad
     */
    getSecurityReport() {
        return {
            blockedCount: this.blockedNumbers.size,
            suspiciousCount: this.suspiciousNumbers.size,
            blockedNumbers: Array.from(this.blockedNumbers),
            suspiciousNumbers: Array.from(this.suspiciousNumbers.entries())
        };
    }
}

module.exports = SecuritySystem;
