// Cargar variables de entorno PRIMERO
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const LawyerPersonality = require('../backend/models/LawyerPersonality');
const ConversationManager = require('../backend/models/ConversationManager');
const CaseManager = require('../backend/models/CaseManager');
const ReminderSystem = require('../backend/models/ReminderSystem');
const ImageHelper = require('../backend/helpers/ImageHelper');

// ⏱️ HELPERS PARA SIMULAR ESCRITURA HUMANA
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simular "está escribiendo..."
const simulateTyping = async (chat, seconds = 3) => {
    await chat.sendStateTyping();
    await sleep(seconds * 1000);
};

// Calcular tiempo de escritura según longitud del mensaje (80-120 chars por segundo)
const calculateTypingTime = (text) => {
    const charsPerSecond = 80 + Math.random() * 40; // 80-120 chars/sec
    const baseTime = (text.length / charsPerSecond) * 1000;
    const thinkingTime = 1000 + Math.random() * 2000; // 1-3 segundos de "pensamiento"
    return Math.min(baseTime + thinkingTime, 8000); // Máximo 8 segundos
};

// Enviar mensaje con efecto de "escribiendo" y a veces "borrar y reescribir"
const sendMessageWithTyping = async (chat, message, shouldRewrite = false) => {
    const typingTime = calculateTypingTime(message);
    
    await simulateTyping(chat, typingTime / 1000);
    
    // 30% de probabilidad de "borrar y reescribir" si shouldRewrite es true
    if (shouldRewrite && Math.random() < 0.3) {
        await chat.sendStateTyping();
        await sleep(1000 + Math.random() * 1500); // Pausa como si borrara
        await simulateTyping(chat, (typingTime / 1000) * 0.7); // Reescribe más rápido
    }
    
    await chat.sendMessage(message);
};

console.log('⚖️ Bot WhatsApp JPS DESPACHO JURÍDICO - Iniciando...');
console.log('🎓 Personalidad de Abogado Profesional activada');
console.log('💬 Sistema de conversaciones activado');
console.log('📋 Sistema de gestión de casos activado');
console.log('📸 Sistema de imágenes profesionales activado');

// Inicializar sistemas
const lawyerPersonality = new LawyerPersonality();
const conversationManager = new ConversationManager();
const caseManager = new CaseManager();
const reminderSystem = new ReminderSystem();

// Crear cliente con autenticación local
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '.wwebjs_auth')
    }),
    puppeteer: { 
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
    // REMOVIDO webVersionCache - puede causar conflictos
});

// Generar código QR
client.on('qr', (qr) => {
    console.log('📱 Escanea este código QR con tu WhatsApp:');
    qrcode.generate(qr, {small: true});
});

// Variables de control para evitar ejecuciones múltiples
let isAuthenticated = false;
let isReady = false;
let isDisconnecting = false;

// Eventos de debugging
client.on('authenticated', () => {
    if (isAuthenticated) return; // Evitar autenticación múltiple
    isAuthenticated = true;
    console.log('🔐 Cliente autenticado correctamente');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
    isAuthenticated = false;
    isReady = false;
    process.exit(1); // Salir para evitar loops infinitos
});

client.on('disconnected', (reason) => {
    // PROTECCIÓN: Evitar procesamiento múltiple de disconnected
    if (isDisconnecting) {
        console.log('⚠️ Evento disconnected duplicado ignorado');
        return;
    }
    isDisconnecting = true;
    
    console.log('🔌 Cliente desconectado:', reason);
    console.log('💡 Razón detallada:', JSON.stringify(reason));
    
    // Si es LOGOUT y ya estábamos listos, algo forzó el cierre
    if (reason === 'LOGOUT' && isReady) {
        console.error('⚠️ LOGOUT INESPERADO - WhatsApp forzó desconexión');
        console.error('💡 Posibles causas:');
        console.error('   1. Sesión abierta en otro dispositivo');
        console.error('   2. WhatsApp detectó comportamiento de bot');
        console.error('   3. Versión de WhatsApp Web desactualizada');
        console.error('   4. Demasiadas operaciones simultáneas');
    }
    
    isAuthenticated = false;
    isReady = false;
    
    // Esperar 2 segundos antes de permitir otro evento de desconexión
    setTimeout(() => {
        isDisconnecting = false;
    }, 2000);
});

// Eventos adicionales para debugging
client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Cargando WhatsApp Web: ${percent}% - ${message}`);
});

client.on('change_state', state => {
    console.log(`🔄 Estado cambiado a: ${state}`);
});

// Cliente listo
client.on('ready', async () => {
    if (isReady) return; // Evitar ejecución múltiple
    isReady = true;
    
    // Inicializar ImageHelper AQUÍ (necesita client)
    global.imageHelper = new ImageHelper(client);
    
    console.log('✅ Bot JPS DESPACHO JURÍDICO conectado exitosamente!');
    console.log('🎯 Bot listo para atender consultas legales');
    console.log('⚖️ Sistema de casos y recordatorios activo');
    
    // Verificar imágenes disponibles
    global.imageHelper.listAvailableImages();
    
    // Esperar 3 segundos para que WhatsApp Web se estabilice COMPLETAMENTE
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('⏰ ReminderSystem temporalmente desactivado para debugging');
    
    // ⏰ ACTIVAR SISTEMA DE RECORDATORIOS - TEMPORALMENTE DESACTIVADO
    // try {
    //     reminderSystem.initializeWithClient(client);
    //     console.log('⏰ SISTEMA DE RECORDATORIOS ACTIVADO - Audiencias y citas organizadas!');
    // } catch (error) {
    //     console.error('⚠️ Error activando recordatorios:', error.message);
    // }
});

// Variables para respuesta rápida
const activeUsers = new Map();

/**
 * 💡 Generar mensaje de ayuda para clientes
 */
function generateClientHelpMessage() {
    return `⚖️ *JPS DESPACHO JURÍDICO*

Hola, soy el Lic. José Patricio Sánchez.

🎯 *MI ESPECIALIDAD:*
IMPUGNACIÓN DE MULTAS - $2,500 MXN
85% de casos ganados

📋 *OTROS SERVICIOS:*
• Divorcios: Desde $12,000
• Laborales: Desde $12,000
• Testamentos: $4,500
• Penales: Desde $25,000

💬 *PREGÚNTAME:*
"Tengo una multa" → Te digo qué hacer
"¿Cuánto cuesta un divorcio?" → Te explico opciones
"Mi patrón no me pagó" → Revisamos el caso

📸 *¿TIENES UNA MULTA?*
Mándame foto de ambos lados.
Reviso en 10 minutos.

⏰ *HORARIO:*
Lun-Vie: 9:00 AM - 6:00 PM
Sáb: 9:00 AM - 2:00 PM

📍 León, Guanajuato
📱 ${process.env.DESPACHO_TELEFONO || '+52 477 724 4259'}

¿En qué te puedo ayudar?

- José Patricio`;
}

/**
 * 📢 Enviar mensaje al dueño
 */
async function sendMessageToOwner(message) {
    try {
        const ownerPhone = process.env.OWNER_PHONE || '5214777244259';
        const ownerChatId = `${ownerPhone}@c.us`;
        
        await client.sendMessage(ownerChatId, message);
        console.log(`📢 Mensaje enviado al dueño: ${ownerPhone}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando mensaje al dueño:', error);
        return false;
    }
}

/**
 * 🔍 Verificar si un número es del dueño
 */
function isOwner(phoneNumber) {
    const ownerPhone = process.env.OWNER_PHONE || '5214777244259';
    return phoneNumber.includes(ownerPhone);
}

/**
Soy tu asistente personal para plantas 🌱`;
}

/**
 * 📋 Generar mensaje de ayuda para el dueño
 */
function generateOwnerHelpMessage() {
    return `⚖️ **COMANDOS DE DUEÑO - DESPACHO JURÍDICO**

📊 **CONSULTAS Y CASOS:**
• \`!casos\` - Ver estadísticas completas del despacho
• \`!pendientes\` - Ver consultas pendientes de agendar
• \`!audiencias\` - Ver audiencias programadas (30 días)

📅 **RECORDATORIOS:**
• \`!recordatorio DD/MM/YYYY HH:MM [mensaje]\` - Crear recordatorio
• \`!misrecordatorios\` - Ver recordatorios pendientes

🔧 **COMANDOS DEL SISTEMA:**
• \`!help\` - Ver este menú de comandos
• \`!reporte\` - Generar reporte del día

💡 **EJEMPLOS:**
• \`!casos\` → Ver estadísticas completas
• \`!pendientes\` → Ver consultas sin agendar
• \`!audiencias\` → Ver próximas audiencias
• \`!recordatorio 15/12/2024 10:00 Audiencia caso divorcio\` → Crear recordatorio

🎯 Solo tú puedes usar estos comandos
⚖️ ¡Tu bot está funcionando perfecto, jefe!`;
}

// Manejo de mensajes INTELIGENTE
client.on('message', async (message) => {
    // FILTRAR mensajes no deseados
    if (message.from === 'status@broadcast' || message.isStatus || message.fromMe) {
        return;
    }

    // FILTRAR notificaciones spam
    if (message.type === 'e2e_notification' || message.type === 'notification_template') {
        return;
    }

    // FILTRAR grupos
    if (message.isGroupMsg) {
        console.log(`🚫 Mensaje de grupo ignorado`);
        return;
    }

    // FILTRAR stickers y audios (pero NO documentos ni imágenes importantes)
    if (message.type === 'sticker' || message.type === 'audio' || message.type === 'video') {
        console.log(`🚫 Sticker/Audio/Video ignorado`);
        return;
    }

    // 📎 MANEJO DE ARCHIVOS (PDFs, Documentos, Imágenes de multas)
    if (message.hasMedia && (message.type === 'document' || message.type === 'image')) {
        console.log(`📎 Archivo recibido - Tipo: ${message.type}`);
        
        try {
            const media = await message.downloadMedia();
            const userPhoneId = message.from;
            const userName = message.notifyName || message.pushname || 'Cliente';
            
            // Guardar archivo
            const fs = require('fs');
            const path = require('path');
            const timestamp = Date.now();
            const extension = media.mimetype.split('/')[1] || 'bin';
            const fileName = `${userPhoneId.replace('@c.us', '')}_${timestamp}.${extension}`;
            const filePath = path.join(__dirname, '../storage/images/received', fileName);
            
            // Crear directorio si no existe
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Guardar archivo
            fs.writeFileSync(filePath, media.data, 'base64');
            console.log(`✅ Archivo guardado: ${fileName}`);
            
            // Respuesta según tipo de archivo
            let fileResponse = '';
            if (message.type === 'document') {
                fileResponse = `📎 *DOCUMENTO RECIBIDO*\n\n` +
                    `✅ Ya lo tengo: ${message._data.filename || 'documento.pdf'}\n\n` +
                    `Reviso esto en las próximas 2 horas.\n` +
                    `Te contacto por este número para decirte qué procede.\n\n` +
                    `¿Es multa de tránsito?\n` +
                    `No la pagues todavía. Costo de impugnación: $2,500 MXN\n` +
                    `85% de mis casos se cancelan.\n\n` +
                    `- Lic. José Patricio`;
            } else if (message.type === 'image') {
                fileResponse = `📸 *FOTO RECIBIDA*\n\n` +
                    `✅ Ya la vi.\n\n` +
                    `Reviso en 10 minutos y te digo exactamente qué procede.\n\n` +
                    `Voy a verificar:\n` +
                    `• Placa correcta\n` +
                    `• Fecha y hora\n` +
                    `• Firma del oficial\n` +
                    `• Motivo claro\n\n` +
                    `Impugnación: $2,500 MXN\n` +
                    `Éxito: 85% canceladas\n\n` +
                    `Espera mi mensaje.\n\n` +
                    `- Lic. José Patricio`;
                
                // 📸 ENVIAR IMAGEN DE EJEMPLO DE MULTA GANADA
                // Esperar 3 segundos y enviar ejemplo de éxito
                setTimeout(async () => {
                    try {
                        if (global.imageHelper) {
                            const sent = await global.imageHelper.sendSuccessExample(message.from);
                            if (sent) {
                                console.log('📸 Imagen de multa cancelada enviada');
                            }
                        }
                    } catch (err) {
                        console.error('❌ Error enviando imagen de ejemplo:', err);
                    }
                }, 3000);
            }
            
            conversationManager.logMessage(userPhoneId, userName, `[ARCHIVO: ${message._data.filename || 'imagen'}]`, true);
            await message.reply(fileResponse);
            conversationManager.logMessage(userPhoneId, process.env.DESPACHO_NOMBRE || 'Despacho', fileResponse, false);
            
            return; // Terminar después de procesar archivo
            
        } catch (error) {
            console.error('❌ Error descargando archivo:', error);
            await message.reply('Hubo un error al recibir el archivo. ¿Puedes enviarlo de nuevo?');
            return;
        }
    }

    // FILTRO ANTI-SPAM - Solo responder a mensajes con contenido relevante
    const messageText = message.body ? message.body.toLowerCase() : '';
    const isRelevantMessage = 
        // Palabras clave legales - CORE: MULTAS
        messageText.includes('multa') || messageText.includes('infracción') ||
        messageText.includes('infracci') || messageText.includes('tránsito') ||
        messageText.includes('transito') || messageText.includes('foto') ||
        // Otros servicios legales
        messageText.includes('abogado') || messageText.includes('legal') ||
        messageText.includes('divorcio') || messageText.includes('testamento') ||
        messageText.includes('demanda') || messageText.includes('laboral') ||
        messageText.includes('penal') || messageText.includes('civil') ||
        messageText.includes('consulta') || messageText.includes('cita') ||
        messageText.includes('asesor') || messageText.includes('ayuda') ||
        messageText.includes('precio') || messageText.includes('costo') ||
        messageText.includes('cuanto') || messageText.includes('servicios') ||
        // Saludos
        messageText.includes('hola') || messageText.includes('buenos') ||
        messageText.includes('que onda') || messageText.includes('qué onda') ||
        messageText.includes('buenas') || messageText.includes('buen día') ||
        // Horarios y disponibilidad
        messageText.includes('horario') || messageText.includes('disponible') ||
        messageText.includes('abierto') || messageText.includes('atención') ||
        // Comandos
        messageText.includes('help') || messageText.startsWith('!') ||
        messageText.length < 4; // Mensajes cortos como "ok", "si", "no"
    
    // **BYPASS PARA DUEÑO - SIEMPRE RESPONDE**
    const isDueñoBypass = isOwner(message.from);
    
    if (!isRelevantMessage && message.type !== 'image' && !isDueñoBypass) {
        console.log(`🚫 Mensaje ignorado (no relevante): "${messageText}"`);
        return; // NO RESPONDER
    }
    
    if (isDueñoBypass && !isRelevantMessage) {
        console.log(`👑 BYPASS DE DUEÑO: Procesando "${messageText}" aunque no sea relevante`);
    }

    console.log(`📩 Mensaje recibido: ${message.body || '[IMAGEN/MEDIA]'}`);
    console.log(`👤 De: ${message.from}`);
    console.log(`📱 Tipo: ${message.type}`);

    // GUARDAR MENSAJE EN HISTORIAL
    const userPhoneId = message.from;
    const userName = message.notifyName || message.pushname || 'Cliente';
    const despachoNombre = process.env.DESPACHO_NOMBRE || "Despacho Jurídico Profesional";
    
    // **DEBUG PARA VERIFICAR SI ES DUEÑO**
    console.log(`🔍 Verificando si ${userPhoneId} es dueño...`);
    const isDueño = isOwner(userPhoneId);
    console.log(`👑 Resultado: ${isDueño ? 'ES DUEÑO' : 'NO ES DUEÑO'}`);
    
    // **OBTENER HISTORIAL ANTES DE GUARDARLO**
    const conversationHistory = await conversationManager.getConversationHistory(userPhoneId);
    
    conversationManager.logMessage(userPhoneId, userName, message.body || '[IMAGEN]', true);

    // SISTEMA DE RESPUESTA MÁS NATURAL
    const now = Date.now();
    const lastActivity = activeUsers.get(userPhoneId) || 0;
    const isActiveConversation = (now - lastActivity) < 120000; // 2 minutos
    const isFirstMessage = conversationHistory.length === 0;
    activeUsers.set(userPhoneId, now);

    // Delays más naturales
    let delay;
    if (isFirstMessage) {
        // Primer mensaje: 3-8 segundos para parecer humano
        delay = Math.floor(Math.random() * 5000) + 3000;
    } else if (isActiveConversation) {
        // Conversación activa: 1-3 segundos
        delay = Math.floor(Math.random() * 2000) + 1000;
    } else {
        // Mensaje después de inactividad: 2-5 segundos
        delay = Math.floor(Math.random() * 3000) + 2000;
    }

    console.log(`⏳ ${isFirstMessage ? '🆕 PRIMER MENSAJE' : isActiveConversation ? '🔥 CONVERSACIÓN ACTIVA' : '💬 REACTIVANDO'} - Esperando ${delay}ms...`);

    // Simular typing con el nuevo sistema
    const chat = await message.getChat();
    await chat.sendStateTyping();
    await sleep(delay);

    let response = '';
    // messageText ya está definido arriba

    // **ANÁLISIS DE CONTEXTO MEJORADO**
    const conversationContext = conversationHistory.slice(-3).map(msg => msg.text).join(' ').toLowerCase();
    const recentMessages = conversationHistory.slice(-2);
    
    // Si ya tengo respuesta por contexto, salir
    if (response) {
        conversationManager.logMessage(userPhoneId, despachoNombre, response, false);
        await message.reply(response);
        return;
    }

    // **COMANDOS DEL DUEÑO**
    if (isOwner(userPhoneId)) {
        // Comando de ayuda para el dueño
        if (messageText === '!help' || messageText === 'help' || messageText === 'comandos') {
            const helpMessage = generateOwnerHelpMessage();
            conversationManager.logMessage(userPhoneId, despachoNombre, helpMessage, false);
            await message.reply(helpMessage);
            console.log('📋 Comandos de dueño enviados');
            return;
        }
        
        // Comando: !casos
        if (messageText === '!casos') {
            const stats = caseManager.getStats();
            const statsMessage = `📊 *ESTADÍSTICAS DEL DESPACHO*\n\n` +
                `Consultas totales: ${stats.total_consultations}\n` +
                `├─ Pendientes: ${stats.pending_consultations}\n` +
                `└─ Agendadas: ${stats.scheduled_consultations}\n\n` +
                `Casos totales: ${stats.total_cases}\n` +
                `├─ Activos: ${stats.active_cases}\n` +
                `└─ Cerrados: ${stats.closed_cases}\n\n` +
                `🚨 Urgentes: ${stats.urgent_items}\n` +
                `📅 Audiencias próximas: ${stats.upcoming_hearings}\n` +
                `💰 Ingresos totales: $${stats.total_revenue.toLocaleString()} MXN`;
            
            conversationManager.logMessage(userPhoneId, despachoNombre, statsMessage, false);
            await message.reply(statsMessage);
            console.log('📊 Estadísticas enviadas');
            return;
        }

        // Comando: !pendientes
        if (messageText === '!pendientes') {
            const pending = caseManager.getPendingConsultations();
            
            if (pending.length === 0) {
                await message.reply('✅ No hay consultas pendientes');
                return;
            }

            let pendingMessage = `📋 *CONSULTAS PENDIENTES* (${pending.length})\n\n`;
            pending.forEach((c, i) => {
                pendingMessage += `${i + 1}. *${c.id}*\n`;
                pendingMessage += `   Cliente: ${c.clientName}\n`;
                pendingMessage += `   Tel: ${c.clientPhone}\n`;
                pendingMessage += `   Asunto: ${c.issue}\n`;
                pendingMessage += `   ${c.urgency === 'urgent' ? '🚨 *URGENTE*' : '📅 Normal'}\n`;
                pendingMessage += `   Fecha: ${new Date(c.createdAt).toLocaleString('es-MX')}\n\n`;
            });

            conversationManager.logMessage(userPhoneId, despachoNombre, pendingMessage, false);
            await message.reply(pendingMessage);
            console.log('📋 Consultas pendientes enviadas');
            return;
        }

        // Comando: !audiencias
        if (messageText === '!audiencias') {
            const hearings = caseManager.getUpcomingHearings(30); // Próximos 30 días
            
            if (hearings.length === 0) {
                await message.reply('✅ No hay audiencias programadas');
                return;
            }

            let hearingsMessage = `📅 *AUDIENCIAS PRÓXIMAS* (${hearings.length})\n\n`;
            hearings.forEach((h, i) => {
                hearingsMessage += `${i + 1}. ${new Date(h.date).toLocaleDateString('es-MX')}\n`;
                hearingsMessage += `   Caso: ${h.caseId}\n`;
                hearingsMessage += `   Tipo: ${h.type}\n`;
                hearingsMessage += `   Lugar: ${h.location}\n`;
                hearingsMessage += `   Cliente: ${h.client.name}\n\n`;
            });

            conversationManager.logMessage(userPhoneId, despachoNombre, hearingsMessage, false);
            await message.reply(hearingsMessage);
            console.log('📅 Audiencias enviadas');
            return;
        }
    }

    // === COMANDO DE AYUDA PARA CLIENTES ===
    if (messageText === '!help' || messageText === 'help' || messageText === 'comandos' || messageText === 'ayuda') {
        const clientHelpMessage = generateClientHelpMessage();
        response = clientHelpMessage;
    }
    
    // === DETECCIÓN DE INTENCIÓN LEGAL Y CREACIÓN DE CONSULTA ===
    else if (messageText.includes('cita') || messageText.includes('consulta') || 
             messageText.includes('asesor') || messageText.includes('necesito ayuda') ||
             messageText.includes('divorcio') || messageText.includes('testamento') ||
             messageText.includes('demanda') || messageText.includes('laboral') ||
             messageText.includes('penal') || messageText.includes('urgente')) {
        
        // Generar respuesta con IA
        const aiResponse = await lawyerPersonality.generateResponse(message.body, {
            intent: 'consulta_legal',
            clientInfo: { name: userName, phone: userPhoneId }
        });

        // Crear consulta automáticamente
        const isUrgent = messageText.includes('urgente') || messageText.includes('urge');
        const consultation = caseManager.createConsultation(
            userPhoneId,
            userName,
            message.body,
            isUrgent ? 'urgent' : 'normal'
        );

        response = aiResponse + `\n\n✅ Consulta registrada: *${consultation.id}*`;

        // Notificar al dueño
        if (!isOwner(userPhoneId)) {
            const despachoNombre = process.env.DESPACHO_NOMBRE || 'Despacho Jurídico';
            await sendMessageToOwner(
                `🔔 *NUEVA CONSULTA ${isUrgent ? '- URGENTE 🚨' : ''}*\n\n` +
                `ID: ${consultation.id}\n` +
                `Cliente: ${userName}\n` +
                `Tel: ${userPhoneId}\n` +
                `Asunto: ${message.body.substring(0, 100)}...\n` +
                `Hora: ${new Date().toLocaleString('es-MX')}`
            );
        }
    }
    
    // === MANEJADOR INTELIGENTE CON IA ===
    // La IA decide cómo responder según el contexto
    
    // Construir contexto detallado de conversación para IA
    let aiConversationContext = '';
    if (conversationHistory.length > 0) {
        const recent = conversationHistory.slice(-3);
        aiConversationContext = recent.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    }
    
    // Detectar intención automáticamente
    let detectedIntent = 'general';
    if (messageText.includes('hola') || messageText.includes('buenas') || messageText.includes('buenos')) {
        detectedIntent = 'saludo';
    } else if (messageText.includes('multa') || messageText.includes('infracción') || messageText.includes('tránsito')) {
        detectedIntent = 'multas';
    } else if (messageText.includes('precio') || messageText.includes('costo') || messageText.includes('cuanto')) {
        detectedIntent = 'precios';
    } else if (messageText.includes('cita') || messageText.includes('consulta') || messageText.includes('asesor')) {
        detectedIntent = 'consulta_legal';
    }
    
    // Generar respuesta inteligente con IA (reutilizamos chat que ya existe arriba)
    await simulateTyping(chat, 2);
    
    try {
        response = await lawyerPersonality.generateResponse(message.body, { 
            intent: detectedIntent,
            clientInfo: { name: userName, phone: userPhoneId },
            conversationHistory: aiConversationContext,
            currentMessage: message.body,
            isFirstContact: conversationHistory.length === 0
        });
        
        await sendMessageWithTyping(chat, response, false);
        conversationManager.logMessage(userPhoneId, userName, message.body, true);
        conversationManager.logMessage(userPhoneId, process.env.DESPACHO_NOMBRE || 'JPS Despacho Jurídico', response, false);
        
        // Enviar imagen contextual según intención
        if (detectedIntent === 'saludo') {
            // SIEMPRE enviar imagen en saludos (denota profesionalismo)
            setTimeout(async () => {
                if (global.imageHelper) {
                    await global.imageHelper.sendImage(message.from, 'BIENVENIDA');
                    console.log('📸 Imagen profesional enviada');
                }
            }, 2500); // 2.5 segundos después del texto
        } else if (detectedIntent === 'precios') {
            setTimeout(async () => {
                if (global.imageHelper) {
                    await global.imageHelper.sendPricing(message.from);
                }
            }, 2000);
        } else if (detectedIntent === 'multas' && (messageText.includes('proceso') || conversationHistory.length === 0)) {
            setTimeout(async () => {
                if (global.imageHelper) {
                    await global.imageHelper.sendFineImpugnation(message.from);
                }
            }, 2000);
        }
        
        return;
        
    } catch (error) {
        console.error('❌ Error generando respuesta:', error);
        response = 'Dame un momento, ¿en qué te puedo ayudar?';
    }

    // ENVIAR RESPUESTA Y GUARDAR
    try {
        const despachoNombre = process.env.DESPACHO_NOMBRE || 'Despacho Jurídico';
        
        // Solo enviar si hay respuesta
        if (!response || response.trim() === '') {
            console.log('⏭️ Sin respuesta para enviar (manejado por bloque específico)');
            return;
        }
        
        // Verificar que el cliente esté listo y conectado
        if (!isReady) {
            console.log('⚠️ Cliente no está listo, esperando...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Verificar estado de WhatsApp
        const state = await client.getState();
        if (state !== 'CONNECTED') {
            console.log(`⚠️ WhatsApp no conectado (Estado: ${state}), abortando envío`);
            return;
        }
        
        // Usar sendMessage en lugar de reply para mayor estabilidad
        let enviado = false;
        let intentos = 0;
        
        while (!enviado && intentos < 3) {
            try {
                await client.sendMessage(message.from, response);
                enviado = true;
                conversationManager.logMessage(userPhoneId, despachoNombre, response, false);
                console.log('✅ Respuesta enviada y guardada');
            } catch (envioError) {
                intentos++;
                console.log(`⚠️ Intento ${intentos}/3 falló, reintentando...`);
                if (intentos < 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
                } else {
                    console.error('❌ Error enviando respuesta después de 3 intentos:', envioError.message);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error general procesando respuesta:', error.message);
    }
});

// Inicializar cliente
client.initialize();

console.log('⚖️ Bot Despacho Jurídico iniciado - Listo para atender consultas legales!');