/**
 * ═══════════════════════════════════════════════════════════════
 * 🤖 BOT WHATSAPP - JPS DESPACHO JURÍDICO
 * ═══════════════════════════════════════════════════════════════
 * 
 * ESTE ES EL CEREBRO DEL BOT
 * Aquí llegan TODOS los mensajes de WhatsApp y se decide qué hacer
 * 
 * ESTRUCTURA:
 * 1. CONFIGURACIÓN INICIAL (líneas 1-60)
 * 2. FUNCIONES AUXILIARES (líneas 61-150)
 * 3. EVENTO DE MENSAJE (líneas 151-fin) ← EL CORAZÓN DEL BOT
 */

// ═══════════════════════════════════════════════════════════════
// 1. CONFIGURACIÓN INICIAL
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Importar módulos del bot
const LawyerPersonality = require('../backend/models/LawyerPersonality');
const ConversationManager = require('../backend/models/ConversationManager');
const CaseManager = require('../backend/models/CaseManager');
const ReminderSystem = require('../backend/models/ReminderSystem');
const ImageHelper = require('../backend/helpers/ImageHelper');
const GoogleVisionMultaAnalyzer = require('../backend/models/GoogleVisionMultaAnalyzer');

console.log('⚖️ Bot JPS DESPACHO JURÍDICO - Iniciando...');

// ═══════════════════════════════════════════════════════════════
// INICIALIZAR SISTEMAS
// ═══════════════════════════════════════════════════════════════

const lawyerPersonality = new LawyerPersonality();
const conversationManager = new ConversationManager();
const caseManager = new CaseManager();
const reminderSystem = new ReminderSystem();
const multaAnalyzer = new GoogleVisionMultaAnalyzer();
let imageHelper = null;

console.log('✅ Sistemas inicializados');

// ═══════════════════════════════════════════════════════════════
// CLIENTE WHATSAPP
// ═══════════════════════════════════════════════════════════════

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Control de usuarios activos (para delays naturales)
const activeUsers = new Map();
let isReady = false;

// ═══════════════════════════════════════════════════════════════
// 2. FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════

/**
 * Esperar X milisegundos
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simular que el bot está escribiendo
 */
const simulateTyping = async (chat, seconds = 2) => {
    await chat.sendStateTyping();
    await sleep(seconds * 1000);
};

/**
 * Verificar si un número es del dueño
 */
function isOwner(phoneNumber) {
    const ownerPhone = process.env.OWNER_PHONE || '5214777244259';
    return phoneNumber.includes(ownerPhone);
}

/**
 * Mensaje de ayuda para comandos del dueño
 */
function getOwnerHelp() {
    return `⚖️ *COMANDOS DEL DUEÑO*

📊 *CONSULTAS Y CASOS:*
• \`!casos\` - Ver estadísticas
• \`!pendientes\` - Consultas sin atender
• \`!audiencias\` - Próximas audiencias

🎯 Solo tú puedes usar estos comandos`;
}

// ═══════════════════════════════════════════════════════════════
// EVENTOS DEL CLIENTE WHATSAPP
// ═══════════════════════════════════════════════════════════════

/**
 * Cuando se genera el QR para escanear
 */
client.on('qr', (qr) => {
    console.log('📱 Escanea este código QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
});

/**
 * Cuando el bot se conecta exitosamente
 */
client.on('ready', async () => {
    console.log('✅ Bot conectado exitosamente!');
    console.log('📱 Número del bot:', client.info.wid.user);
    isReady = true;
    
    // Inicializar sistema de imágenes
    imageHelper = new ImageHelper(client);
    global.imageHelper = imageHelper;
    
    // Cargar recordatorios
    reminderSystem.loadReminders();
    reminderSystem.startChecking();
    
    // Enviar mensaje de presentación al dueño
    try {
        const ownerNumber = process.env.OWNER_PHONE + '@c.us';
        await client.sendMessage(ownerNumber, 
            `⚖️ *BOT INICIADO CORRECTAMENTE*\n\n` +
            `👋 Hola, soy tu asistente legal automatizado de JPS Despacho Jurídico.\n\n` +
            `📱 *Número del bot:* ${client.info.wid.user}\n` +
            `🤖 *Sistemas activos:*\n` +
            `   ✅ Análisis de multas con Google Vision\n` +
            `   ✅ Gestión de casos\n` +
            `   ✅ Sistema de recordatorios\n` +
            `   ✅ Conversaciones inteligentes\n\n` +
            `📊 *Capacidad de análisis:*\n` +
            `   • Extrae 12 campos de multas automáticamente\n` +
            `   • Precisión: 95% con Google Vision OCR\n` +
            `   • 1,000 análisis gratis/mes\n\n` +
            `💡 Cuando alguien envíe una foto de multa, la analizaré automáticamente y extraeré todos los datos.\n\n` +
            `✅ Todo listo para recibir consultas.`
        );
        console.log('📨 Mensaje de bienvenida enviado al dueño');
    } catch (error) {
        console.error('❌ Error enviando mensaje de bienvenida:', error.message);
    }
});

/**
 * Cuando se autentica el cliente
 */
client.on('authenticated', () => {
    console.log('🔐 Cliente autenticado');
});

/**
 * Si hay error de autenticación
 */
client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
});

// ═══════════════════════════════════════════════════════════════
// 3. EVENTO PRINCIPAL: RECEPCIÓN DE MENSAJES
// ═══════════════════════════════════════════════════════════════

client.on('message', async (message) => {
    
    // ───────────────────────────────────────────────────────────
    // FILTROS: Qué mensajes IGNORAR
    // ───────────────────────────────────────────────────────────
    
    // Ignorar estados de WhatsApp
    if (message.from === 'status@broadcast' || message.isStatus || message.fromMe) {
        return;
    }
    
    // Ignorar notificaciones del sistema
    if (message.type === 'e2e_notification' || message.type === 'notification_template') {
        return;
    }
    
    // Ignorar grupos
    if (message.isGroupMsg) {
        console.log('🚫 Mensaje de grupo ignorado');
        return;
    }
    
    // Ignorar stickers, audios, videos
    if (message.type === 'sticker' || message.type === 'audio' || message.type === 'video') {
        console.log('🚫 Multimedia no soportado ignorado');
        return;
    }
    
    console.log(`📩 Mensaje recibido: ${message.body || '[ARCHIVO]'}`);
    console.log(`👤 De: ${message.from}`);
    
    // ───────────────────────────────────────────────────────────
    // MANEJO DE ARCHIVOS (PDFs, Imágenes de multas)
    // ───────────────────────────────────────────────────────────
    
    if (message.hasMedia && (message.type === 'document' || message.type === 'image')) {
        console.log(`📎 Archivo recibido - Tipo: ${message.type}`);
        
        try {
            const media = await message.downloadMedia();
            const userPhoneId = message.from;
            const userName = message.notifyName || 'Cliente';
            
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
            
            // Respuesta cuando recibe FOTO DE MULTA
            let fileResponse = '';
            if (message.type === 'image') {
                // ANALIZAR LA FOTO CON GOOGLE VISION
                console.log('🔍 Analizando foto de multa con Google Vision...');
                
                const resultadoAnalisis = await multaAnalyzer.analizarMulta(filePath);
                
                if (resultadoAnalisis.exito) {
                    // Usar el mensaje formateado del analizador
                    fileResponse = resultadoAnalisis.mensaje;
                    
                } else {
                    // Si falla el análisis, usar respuesta genérica
                    fileResponse = `📸 *FOTO DE MULTA RECIBIDA*\n\n` +
                        `✅ El Lic. José Patricio la revisará.\n\n` +
                        `💰 *INVERSIÓN:* $2,500 MXN\n` +
                        `📊 *TASA DE ÉXITO:* 97% (330/340 ganados)\n` +
                        `⏱️ *TIEMPO:* 4-6 meses\n\n` +
                        `📋 *PARA INICIAR NECESITAS:*\n` +
                        `1️⃣ Multa ORIGINAL en físico\n` +
                        `2️⃣ Pago de $2,500 MXN\n` +
                        `3️⃣ Copia de licencia + tarjeta circulación\n\n` +
                        `📍 León, Guanajuato\n` +
                        `📱 +52 477 724 4259\n\n` +
                        `¿Deseas agendar cita para entregar?`;
                }
                
                // Enviar imagen con información después de 3 segundos
                setTimeout(async () => {
                    try {
                        if (global.imageHelper) {
                            await global.imageHelper.sendFineImpugnation(message.from);
                            console.log('📸 Imagen de impugnación enviada');
                        }
                    } catch (err) {
                        console.error('❌ Error enviando imagen:', err);
                    }
                }, 3000);
            }
            
            conversationManager.logMessage(userPhoneId, userName, `[ARCHIVO: ${fileName}]`, true);
            await message.reply(fileResponse);
            conversationManager.logMessage(userPhoneId, process.env.DESPACHO_NOMBRE || 'Despacho', fileResponse, false);
            
            return; // Terminar después de procesar archivo
            
        } catch (error) {
            console.error('❌ Error descargando archivo:', error);
            await message.reply('Hubo un error al recibir el archivo. ¿Puedes enviarlo de nuevo?');
            return;
        }
    }
    
    // ───────────────────────────────────────────────────────────
    // OBTENER DATOS DEL USUARIO Y MENSAJE
    // ───────────────────────────────────────────────────────────
    
    const userPhoneId = message.from;
    const userName = message.notifyName || message.pushname || 'Cliente';
    const messageText = message.body ? message.body.toLowerCase() : '';
    const despachoNombre = process.env.DESPACHO_NOMBRE || 'JPS Despacho Jurídico';
    
    // Obtener historial de conversación
    const conversationHistory = await conversationManager.getConversationHistory(userPhoneId);
    conversationManager.logMessage(userPhoneId, userName, message.body, true);
    
    // ───────────────────────────────────────────────────────────
    // SISTEMA DE DELAYS NATURALES (parecer humano)
    // ───────────────────────────────────────────────────────────
    
    const now = Date.now();
    const lastActivity = activeUsers.get(userPhoneId) || 0;
    const isActiveConversation = (now - lastActivity) < 120000; // 2 minutos
    const isFirstMessage = conversationHistory.length === 0;
    activeUsers.set(userPhoneId, now);
    
    let delay;
    if (isFirstMessage) {
        delay = Math.floor(Math.random() * 5000) + 3000; // 3-8 segundos
    } else if (isActiveConversation) {
        delay = Math.floor(Math.random() * 2000) + 1000; // 1-3 segundos
    } else {
        delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 segundos
    }
    
    console.log(`⏳ Esperando ${delay}ms antes de responder...`);
    
    const chat = await message.getChat();
    await chat.sendStateTyping();
    await sleep(delay);
    
    // ───────────────────────────────────────────────────────────
    // COMANDOS DEL DUEÑO
    // ───────────────────────────────────────────────────────────
    
    if (isOwner(userPhoneId)) {
        
        // !help
        if (messageText === '!help' || messageText === 'help') {
            const helpMessage = getOwnerHelp();
            await message.reply(helpMessage);
            console.log('📋 Comandos de dueño enviados');
            return;
        }
        
        // !casos
        if (messageText === '!casos') {
            const stats = caseManager.getStats();
            const statsMessage = `📊 *ESTADÍSTICAS DEL DESPACHO*\n\n` +
                `Consultas totales: ${stats.total_consultations}\n` +
                `├─ Pendientes: ${stats.pending_consultations}\n` +
                `└─ Agendadas: ${stats.scheduled_consultations}\n\n` +
                `Casos totales: ${stats.total_cases}\n` +
                `├─ Activos: ${stats.active_cases}\n` +
                `└─ Cerrados: ${stats.closed_cases}`;
            
            await message.reply(statsMessage);
            console.log('📊 Estadísticas enviadas');
            return;
        }
        
        // !pendientes
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
                pendingMessage += `   Asunto: ${c.issue}\n\n`;
            });
            
            await message.reply(pendingMessage);
            console.log('📋 Consultas pendientes enviadas');
            return;
        }
        
        // !audiencias
        if (messageText === '!audiencias') {
            const hearings = caseManager.getUpcomingHearings(30);
            
            if (hearings.length === 0) {
                await message.reply('✅ No hay audiencias programadas');
                return;
            }
            
            let hearingsMessage = `📅 *AUDIENCIAS PRÓXIMAS* (${hearings.length})\n\n`;
            hearings.forEach((h, i) => {
                hearingsMessage += `${i + 1}. ${new Date(h.date).toLocaleDateString('es-MX')}\n`;
                hearingsMessage += `   Caso: ${h.caseId}\n`;
                hearingsMessage += `   Cliente: ${h.client.name}\n\n`;
            });
            
            await message.reply(hearingsMessage);
            console.log('📅 Audiencias enviadas');
            return;
        }
    }
    
    // ───────────────────────────────────────────────────────────
    // FILTRO ANTI-SPAM: Solo responder mensajes relevantes
    // ───────────────────────────────────────────────────────────
    
    const isRelevantMessage = 
        // Multas
        messageText.includes('multa') || messageText.includes('infracción') ||
        messageText.includes('tránsito') || messageText.includes('transito') ||
        // Servicios legales
        messageText.includes('abogado') || messageText.includes('legal') ||
        messageText.includes('testamento') || messageText.includes('demanda') ||
        messageText.includes('laboral') || messageText.includes('penal') ||
        messageText.includes('consulta') || messageText.includes('cita') ||
        messageText.includes('precio') || messageText.includes('costo') ||
        // Saludos
        messageText.includes('hola') || messageText.includes('buenos') ||
        messageText.includes('buenas') || messageText.includes('buen') ||
        // Urgencias
        messageText.includes('urgente') || messageText.includes('ayuda');
    
    if (!isRelevantMessage) {
        console.log('🚫 Mensaje no relevante ignorado');
        return;
    }
    
    // ───────────────────────────────────────────────────────────
    // DETECCIÓN DE INTENCIÓN
    // ───────────────────────────────────────────────────────────
    
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
    
    console.log(`🎯 Intención detectada: ${detectedIntent}`);
    
    // ───────────────────────────────────────────────────────────
    // GENERAR Y ENVIAR RESPUESTA
    // ───────────────────────────────────────────────────────────
    
    try {
        // CASO ESPECIAL: Saludo simple sin más palabras
        const esSaludoSimple = (messageText.includes('hola') || messageText.includes('buenas') || 
                                messageText.includes('buenos') || messageText.includes('buen día')) &&
                               messageText.split(' ').length <= 3;
        
        if (detectedIntent === 'saludo' && esSaludoSimple) {
            // SOLO ENVIAR IMAGEN, SIN TEXTO
            console.log('👋 Saludo simple detectado - Enviando solo imagen');
            
            setTimeout(async () => {
                if (global.imageHelper) {
                    await global.imageHelper.sendImage(message.from, 'BIENVENIDA');
                    console.log('📸 Imagen de bienvenida enviada');
                }
            }, 1500);
            
            return; // No enviar texto
        }
        
        // CASO NORMAL: Generar respuesta con IA
        const aiConversationContext = conversationHistory.slice(-3)
            .map(msg => `${msg.sender}: ${msg.text}`)
            .join('\n');
        
        const response = await lawyerPersonality.generateResponse(message.body, { 
            intent: detectedIntent,
            clientInfo: { name: userName, phone: userPhoneId },
            conversationHistory: aiConversationContext,
            currentMessage: message.body,
            isFirstContact: conversationHistory.length === 0
        });
        
        await simulateTyping(chat, 2);
        await message.reply(response);
        
        conversationManager.logMessage(userPhoneId, despachoNombre, response, false);
        console.log('✅ Respuesta enviada');
        
        // Enviar imagen contextual si es necesario
        if (detectedIntent === 'precios') {
            setTimeout(async () => {
                if (global.imageHelper) {
                    await global.imageHelper.sendPricing(message.from);
                }
            }, 2000);
        }
        
    } catch (error) {
        console.error('❌ Error generando respuesta:', error);
        await message.reply('Dame un momento, ¿en qué te puedo ayudar?');
    }
});

// ═══════════════════════════════════════════════════════════════
// INICIAR EL BOT
// ═══════════════════════════════════════════════════════════════

client.initialize();

console.log('🚀 Bot listo para atender consultas!');
