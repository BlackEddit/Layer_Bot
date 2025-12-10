/**
 * 📊 ADVANCED CONVERSATION TRACKER
 * 
 * Sistema avanzado de seguimiento de conversaciones basado en mejores prácticas
 * de asistentes virtuales exitosos (Intercom, Drift, ChatGPT)
 * 
 * CARACTERÍSTICAS:
 * - Guarda TODA la conversación con metadata
 * - Detecta intenciones automáticamente
 * - Analiza sentimiento del cliente
 * - Rastrea tiempo de respuesta
 * - Identifica oportunidades de venta
 * - Genera reportes de conversión
 */

const fs = require('fs');
const path = require('path');

class AdvancedConversationTracker {
    constructor() {
        this.trackerFile = path.join(__dirname, '../../storage/data/conversation_analytics.json');
        this.analytics = this.loadAnalytics();
    }

    loadAnalytics() {
        try {
            if (fs.existsSync(this.trackerFile)) {
                const data = fs.readFileSync(this.trackerFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('❌ Error cargando analytics:', error);
        }
        
        return {
            conversations: {},
            stats: {
                totalConversations: 0,
                totalMessages: 0,
                averageResponseTime: 0,
                conversionRate: 0,
                commonIntents: {},
                commonQuestions: []
            },
            lastUpdated: new Date().toISOString()
        };
    }

    saveAnalytics() {
        try {
            const dataDir = path.dirname(this.trackerFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            this.analytics.lastUpdated = new Date().toISOString();
            fs.writeFileSync(this.trackerFile, JSON.stringify(this.analytics, null, 2));
            return true;
        } catch (error) {
            console.error('❌ Error guardando analytics:', error);
            return false;
        }
    }

    /**
     * 📝 TRACK MENSAJE COMPLETO
     * Guarda mensaje con metadata completa
     */
    trackMessage(userId, userName, message, metadata = {}) {
        const timestamp = new Date().toISOString();
        const conversationId = metadata.conversationId || this.getOrCreateConversationId(userId);

        // Crear conversación si no existe
        if (!this.analytics.conversations[conversationId]) {
            this.analytics.conversations[conversationId] = {
                id: conversationId,
                userId: userId,
                userName: userName,
                startedAt: timestamp,
                lastMessageAt: timestamp,
                status: 'active', // active, converted, abandoned, resolved
                messages: [],
                intents: [],
                detectedNeeds: [],
                sentiment: 'neutral', // positive, neutral, negative
                responseTimeMs: [],
                convertedToCase: false,
                caseId: null,
                metadata: {}
            };
            this.analytics.stats.totalConversations++;
        }

        const conversation = this.analytics.conversations[conversationId];

        // Agregar mensaje
        conversation.messages.push({
            timestamp: timestamp,
            sender: metadata.isFromUser ? userName : 'JPS Asistente',
            message: message,
            intent: metadata.intent || this.detectIntent(message),
            sentiment: this.analyzeSentiment(message),
            responseTimeMs: metadata.responseTimeMs || null
        });

        // Actualizar metadata
        conversation.lastMessageAt = timestamp;
        if (metadata.intent) {
            if (!conversation.intents.includes(metadata.intent)) {
                conversation.intents.push(metadata.intent);
            }
        }

        // Detectar necesidades
        const needs = this.detectNeeds(message);
        needs.forEach(need => {
            if (!conversation.detectedNeeds.includes(need)) {
                conversation.detectedNeeds.push(need);
            }
        });

        // Actualizar stats
        this.analytics.stats.totalMessages++;
        if (metadata.responseTimeMs) {
            conversation.responseTimeMs.push(metadata.responseTimeMs);
        }

        this.saveAnalytics();
        
        console.log(`📊 Analytics guardados: ${conversationId} - Intent: ${metadata.intent || 'auto'}`);
        
        return conversationId;
    }

    /**
     * 🎯 DETECTAR INTENCIÓN AUTOMÁTICAMENTE
     */
    detectIntent(message) {
        const lower = message.toLowerCase();
        
        if (lower.includes('hola') || lower.includes('buenos')) return 'saludo';
        if (lower.includes('multa') || lower.includes('infracción')) return 'impugnacion_multa';
        if (lower.includes('precio') || lower.includes('costo')) return 'consulta_precio';
        if (lower.includes('laboral') || lower.includes('despido')) return 'laboral';
        if (lower.includes('testamento') || lower.includes('herencia')) return 'testamentos';
        if (lower.includes('gracias')) return 'despedida';
        if (lower.includes('cuánto tarda') || lower.includes('tiempo')) return 'consulta_tiempo';
        
        return 'general';
    }

    /**
     * 😊 ANALIZAR SENTIMIENTO
     */
    analyzeSentiment(message) {
        const lower = message.toLowerCase();
        
        // Positivo
        const positive = ['gracias', 'excelente', 'perfecto', 'genial', 'bueno', 'bien'];
        if (positive.some(word => lower.includes(word))) return 'positive';
        
        // Negativo
        const negative = ['molesto', 'injusto', 'mal', 'problema', 'urgente', 'coraje'];
        if (negative.some(word => lower.includes(word))) return 'negative';
        
        return 'neutral';
    }

    /**
     * 🔍 DETECTAR NECESIDADES
     */
    detectNeeds(message) {
        const lower = message.toLowerCase();
        const needs = [];
        
        if (lower.includes('multa')) needs.push('impugnacion_multa');
        if (lower.includes('laboral') || lower.includes('despido')) needs.push('laboral');
        if (lower.includes('testamento')) needs.push('testamento');
        if (lower.includes('urgente')) needs.push('urgencia');
        if (lower.includes('consulta')) needs.push('consulta_legal');
        
        return needs;
    }

    /**
     * 💰 MARCAR CONVERSACIÓN COMO CONVERTIDA
     */
    markAsConverted(conversationId, caseId) {
        if (this.analytics.conversations[conversationId]) {
            this.analytics.conversations[conversationId].convertedToCase = true;
            this.analytics.conversations[conversationId].caseId = caseId;
            this.analytics.conversations[conversationId].status = 'converted';
            this.saveAnalytics();
            
            // Actualizar tasa de conversión
            this.updateConversionRate();
        }
    }

    /**
     * 📈 ACTUALIZAR TASA DE CONVERSIÓN
     */
    updateConversionRate() {
        const total = Object.keys(this.analytics.conversations).length;
        const converted = Object.values(this.analytics.conversations)
            .filter(c => c.convertedToCase).length;
        
        this.analytics.stats.conversionRate = total > 0 ? (converted / total * 100).toFixed(2) : 0;
    }

    /**
     * 🔑 OBTENER O CREAR ID DE CONVERSACIÓN
     */
    getOrCreateConversationId(userId) {
        // Buscar conversación activa
        const active = Object.values(this.analytics.conversations)
            .find(c => c.userId === userId && c.status === 'active');
        
        if (active) return active.id;
        
        // Crear nueva
        const timestamp = Date.now();
        return `conv_${userId}_${timestamp}`;
    }

    /**
     * 📊 OBTENER ESTADÍSTICAS
     */
    getStats() {
        const conversations = Object.values(this.analytics.conversations);
        
        return {
            total: conversations.length,
            active: conversations.filter(c => c.status === 'active').length,
            converted: conversations.filter(c => c.convertedToCase).length,
            conversionRate: this.analytics.stats.conversionRate,
            totalMessages: this.analytics.stats.totalMessages,
            commonIntents: this.getCommonIntents(conversations),
            avgMessagesPerConversation: conversations.length > 0 
                ? (this.analytics.stats.totalMessages / conversations.length).toFixed(1) 
                : 0
        };
    }

    /**
     * 🎯 OBTENER INTENCIONES MÁS COMUNES
     */
    getCommonIntents(conversations) {
        const intentCounts = {};
        
        conversations.forEach(conv => {
            conv.intents.forEach(intent => {
                intentCounts[intent] = (intentCounts[intent] || 0) + 1;
            });
        });
        
        return Object.entries(intentCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([intent, count]) => ({ intent, count }));
    }

    /**
     * 📋 OBTENER CONVERSACIÓN COMPLETA
     */
    getConversation(conversationId) {
        return this.analytics.conversations[conversationId] || null;
    }

    /**
     * 🔍 BUSCAR CONVERSACIONES POR USUARIO
     */
    getConversationsByUser(userId) {
        return Object.values(this.analytics.conversations)
            .filter(c => c.userId === userId);
    }
}

module.exports = AdvancedConversationTracker;
