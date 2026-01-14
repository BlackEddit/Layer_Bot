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
const SecuritySystem = require('../backend/models/SecuritySystem');
const LegalDocumentGenerator = require('../backend/models/LegalDocumentGenerator');
const { MessageMedia } = require('whatsapp-web.js');

console.log('⚖️ Bot JPS DESPACHO JURÍDICO - Iniciando...');

// ═══════════════════════════════════════════════════════════════
// INICIALIZAR SISTEMAS
// ═══════════════════════════════════════════════════════════════

const lawyerPersonality = new LawyerPersonality();
const conversationManager = new ConversationManager();
const caseManager = new CaseManager();
const reminderSystem = new ReminderSystem();
const multaAnalyzer = new GoogleVisionMultaAnalyzer();
const securitySystem = new SecuritySystem();
const documentGenerator = new LegalDocumentGenerator();
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

🛡️ *SEGURIDAD:*
• \`!seguridad\` - Ver reporte de seguridad
• \`!bloquear [número]\` - Bloquear número
• \`!desbloquear [número]\` - Desbloquear número

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
    // 🛡️ SISTEMA DE SEGURIDAD
    // ───────────────────────────────────────────────────────────
    
    // 1. Verificar si debe responder (bloqueos + modo pruebas)
    if (!securitySystem.shouldRespond(message.from)) {
        if (securitySystem.isBlocked(message.from)) {
            console.log(`🚫 Número bloqueado: ${message.from}`);
        } else {
            console.log(`🧪 Modo pruebas activo - Número no autorizado: ${message.from}`);
        }
        return; // No responder
    }
    
    // 2. PRIORIDAD: Procesar imágenes/archivos ANTES de cualquier otra cosa
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
                    
                    // GENERAR DOCUMENTO LEGAL
                    try {
                        console.log('📄 Generando documento de demanda...');
                        const nombreInfractor = resultadoAnalisis.datos.nombreInfractor || 'INFRACTOR NO ESPECIFICADO';
                        const documentPath = await documentGenerator.generarDemanda(
                            resultadoAnalisis.datos,
                            nombreInfractor
                        );
                        
                        // Enviar documento a los números específicos
                        const numerosDestino = [
                            '5214777244259@c.us', // Número del dueño
                            '5214773241596@c.us'  // Número para asuntos legales
                        ];
                        
                        for (const numeroDestino of numerosDestino) {
                            try {
                                const media = MessageMedia.fromFilePath(documentPath);
                                
                                // Mensaje que acompaña el documento
                                const mensajeDoc = `📋 *DEMANDA GENERADA*\n\n` +
                                    `👤 *Destinatario:* ${numeroDestino.replace('@c.us', '')}\n` +
                                    `📝 *Infraccionado:* ${nombreInfractor}\n` +
                                    `📑 *Folio:* ${resultadoAnalisis.datos.folio || 'No especificado'}\n` +
                                    `📅 *Fecha infracción:* ${resultadoAnalisis.datos.fechaInfraccion || 'No especificado'}\n` +
                                    `🚗 *Placas:* ${resultadoAnalisis.datos.placas || 'No especificado'}\n\n` +
                                    `⚠️ *IMPORTANTE:* Aún no se ha realizado el pago de $2,500 MXN`;
                                
                                await client.sendMessage(numeroDestino, media, { caption: mensajeDoc });
                                console.log(`📤 Documento enviado a: ${numeroDestino}`);
                            } catch (errorEnvio) {
                                console.error(`❌ Error enviando documento a ${numeroDestino}:`, errorEnvio);
                            }
                        }
                        
                        // SOLICITAR PAGO AL NÚMERO LEGAL (477 324 1596)
                        setTimeout(async () => {
                            try {
                                const numeroLegal = '5214773241596@c.us';
                                const mensajePago = `💰 *SOLICITUD DE PAGO*\n\n` +
                                    `Lic. Patricio, le solicito amablemente gestione el cobro de:\n\n` +
                                    `👤 *Cliente:* ${nombreInfractor}\n` +
                                    `📑 *Folio multa:* ${resultadoAnalisis.datos.folio || 'No especificado'}\n` +
                                    `💵 *Monto:* $2,500 MXN\n\n` +
                                    `*Métodos de pago disponibles:*\n` +
                                    `• 💳 Mercado Pago\n` +
                                    `• 🏦 Transferencia bancaria\n` +
                                    `• 💵 Efectivo\n\n` +
                                    `Una vez recibido el pago, confirme para proceder con la impugnación.`;
                                
                                await client.sendMessage(numeroLegal, mensajePago);
                                console.log('💰 Solicitud de pago enviada al licenciado');
                            } catch (errorPago) {
                                console.error('❌ Error enviando solicitud de pago:', errorPago);
                            }
                        }, 2000);
                        
                    } catch (errorDoc) {
                        console.error('❌ Error generando/enviando documento:', errorDoc);
                    }
                    
                } else {
                    // Si falla el análisis, usar respuesta genérica
                    fileResponse = `📸 *FOTO DE MULTA RECIBIDA*\n\n` +
                        `✅ Nuestro equipo legal la revisará.\n\n` +
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
    
    // 3. Detectar intentos de extorsión (solo para mensajes de texto)
    if (message.body) {
        const extorsionCheck = securitySystem.detectExtorsion(message.body);
        
        if (extorsionCheck.isExtorsion) {
            console.log(`🚨 ALERTA: Posible extorsión detectada de ${message.from}`);
            console.log(`   Palabras clave: ${extorsionCheck.keywords.join(', ')}`);
            
            // Marcar como sospechoso
            const suspiciousResult = securitySystem.markSuspicious(message.from);
            
            // Enviar advertencia
            await message.reply(securitySystem.getWarningMessage(extorsionCheck.severity));
            
            // Notificar al dueño
            const ownerNumber = process.env.OWNER_PHONE + '@c.us';
            await client.sendMessage(ownerNumber, 
                `🚨 *ALERTA DE SEGURIDAD*\n\n` +
                `Posible intento de extorsión detectado:\n\n` +
                `📱 Número: ${message.from}\n` +
                `📝 Mensaje: "${message.body.substring(0, 200)}..."\n` +
                `⚠️ Palabras clave: ${extorsionCheck.keywords.join(', ')}\n` +
                `🔢 Intentos: ${suspiciousResult.count}/3\n` +
                `${suspiciousResult.blocked ? '🚫 Número BLOQUEADO automáticamente' : '⚠️ Marcado como sospechoso'}`
            );
            
            return; // No continuar con conversación normal
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
    
    // 4. Mensaje automático de identificación (primera vez que escriben)
    const isFirstContact = securitySystem.isFirstContact(message.from, conversationHistory);
    
    if (isFirstContact) {
        console.log(`👋 Primer contacto de: ${message.from}`);
        
        // Solo enviar imagen con caption (sin mensaje de texto adicional)
        setTimeout(async () => {
            if (global.imageHelper) {
                await global.imageHelper.sendImage(message.from, 'BIENVENIDA');
                console.log('📸 Imagen de bienvenida enviada');
            }
        }, 1500);
        
        return; // No continuar procesando, ya respondimos
    }
    
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
        
        // !seguridad - Ver reporte de seguridad
        if (messageText === '!seguridad' || messageText === '!security') {
            const report = securitySystem.getSecurityReport();
            let securityMessage = `🛡️ *REPORTE DE SEGURIDAD*\n\n`;
            
            // Modo pruebas
            if (securitySystem.testMode) {
                securityMessage += `🧪 *MODO PRUEBAS: ACTIVO*\n`;
                securityMessage += `✅ Números permitidos: ${securitySystem.allowedNumbers.size}\n\n`;
            } else {
                securityMessage += `🌐 *MODO: PRODUCCIÓN*\n`;
                securityMessage += `✅ Respondiendo a todos los números\n\n`;
            }
            
            securityMessage += `🚫 Números bloqueados: ${report.blockedCount}\n`;
            securityMessage += `⚠️ Números sospechosos: ${report.suspiciousCount}\n\n`;
            
            if (report.blockedNumbers.length > 0) {
                securityMessage += `📋 *BLOQUEADOS:*\n`;
                report.blockedNumbers.slice(0, 5).forEach(num => {
                    securityMessage += `  • ${num}\n`;
                });
                if (report.blockedNumbers.length > 5) {
                    securityMessage += `  ... y ${report.blockedNumbers.length - 5} más\n`;
                }
            }
            
            await message.reply(securityMessage);
            console.log('🛡️ Reporte de seguridad enviado');
            return;
        }
        
        // !bloquear [número] - Bloquear número manualmente
        if (messageText.startsWith('!bloquear ')) {
            const numberToBlock = messageText.replace('!bloquear ', '').trim();
            securitySystem.blockNumber(numberToBlock + '@c.us', 'Bloqueado por dueño');
            await message.reply(`🚫 Número bloqueado: ${numberToBlock}`);
            return;
        }
        
        // !desbloquear [número] - Desbloquear número
        if (messageText.startsWith('!desbloquear ')) {
            const numberToUnblock = messageText.replace('!desbloquear ', '').trim() + '@c.us';
            const wasBlocked = securitySystem.unblockNumber(numberToUnblock);
            if (wasBlocked) {
                await message.reply(`✅ Número desbloqueado`);
            } else {
                await message.reply(`❌ Ese número no estaba bloqueado`);
            }
            return;
        }
    }
    
    // ───────────────────────────────────────────────────────────
    // FILTRO ANTI-SPAM: Solo responder mensajes relevantes
    // ───────────────────────────────────────────────────────────
    
    const isRelevantMessage = 
        // Opciones del menú (01, 02, 03, 04 o 1, 2, 3, 4)
        /^0?[1-4]$/.test(messageText.trim()) ||
        // Multas
        messageText.includes('multa') || messageText.includes('infracción') ||
        messageText.includes('tránsito') || messageText.includes('transito') ||
        messageText.includes('impugnación') || messageText.includes('impugnacion') ||
        // Servicios legales
        messageText.includes('abogado') || messageText.includes('legal') ||
        messageText.includes('testamento') || messageText.includes('demanda') ||
        messageText.includes('laboral') || messageText.includes('penal') ||
        messageText.includes('consulta') || messageText.includes('cita') ||
        messageText.includes('precio') || messageText.includes('costo') ||
        messageText.includes('familiar') || messageText.includes('familia') ||
        messageText.includes('contrato') || messageText.includes('civil') ||
        // Saludos
        messageText.includes('hola') || messageText.includes('buenos') ||
        messageText.includes('buenas') || messageText.includes('buen') ||
        messageText.includes('hi') || messageText.includes('hey') ||
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
    
    // Detectar selección de opciones del menú (01, 02, 03, 04 o simplemente 1, 2, 3, 4)
    const menuOption = messageText.trim();
    if (menuOption === '01' || menuOption === '1' || messageText.includes('impugnación') || messageText.includes('impugnacion')) {
        detectedIntent = 'multas';
    } else if (menuOption === '02' || menuOption === '2' || messageText.includes('laboral')) {
        detectedIntent = 'derecho_laboral';
    } else if (menuOption === '03' || menuOption === '3' || messageText.includes('familiar') || messageText.includes('familia')) {
        detectedIntent = 'asuntos_familiares';
    } else if (menuOption === '04' || menuOption === '4' || messageText.includes('contrato') || messageText.includes('civil')) {
        detectedIntent = 'contratos_civiles';
    } else if (messageText.includes('hola') || messageText.includes('buenas') || messageText.includes('buenos') ||
        messageText.includes('hi') || messageText.includes('hey')) {
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
                                messageText.includes('buenos') || messageText.includes('buen día') ||
                                messageText.includes('hi') || messageText.includes('hey')) &&
                               messageText.split(' ').length <= 3;
        
        if (detectedIntent === 'saludo' && esSaludoSimple) {
            // SOLO ENVIAR IMAGEN DE BIENVENIDA (sin texto)
            console.log('👋 Saludo simple detectado - Enviando solo imagen');
            
            setTimeout(async () => {
                if (global.imageHelper) {
                    await global.imageHelper.sendImage(message.from, 'BIENVENIDA');
                    console.log('📸 Imagen de bienvenida enviada');
                }
            }, 1500);
            
            return;
        }
        
        // CASO ESPECIAL: Usuario seleccionó OPCIÓN 01 - IMPUGNACIÓN DE FOTOMULTAS
        if (menuOption === '01' || menuOption === '1' || messageText === 'fotomulta' || messageText === 'fotomultas') {
            console.log('📸 Opción 01: FOTOMULTAS - Enviando respuesta específica');
            
            const respuestaFotomultas = `📸 *IMPUGNACIÓN DE FOTOMULTAS*\n\n` +
                `✅ *¿CÓMO FUNCIONA?*\n` +
                `1️⃣ Envías foto de ambos lados de tu fotomulta\n` +
                `2️⃣ La analizamos con Google Vision AI\n` +
                `3️⃣ Generamos demanda contencioso administrativa\n` +
                `4️⃣ La presentamos ante el Juez Administrativo\n\n` +
                `💰 *INVERSIÓN:* $2,500 MXN\n` +
                `📊 *TASA DE ÉXITO:* 97% (330/340 casos ganados)\n` +
                `⏱️ *TIEMPO PROMEDIO:* 4-6 meses\n\n` +
                `📋 *REQUISITOS PARA INICIAR:*\n` +
                `• Fotomulta ORIGINAL en físico\n` +
                `• Pago de $2,500 MXN\n` +
                `• Copia de licencia de conducir\n` +
                `• Tarjeta de circulación\n\n` +
                `📸 *¡ENVÍA TU FOTOMULTA AHORA!*\n` +
                `Por favor envíame una foto donde se vean claramente los campos marcados en verde.`;
            
            await simulateTyping(chat, 2);
            await message.reply(respuestaFotomultas);
            conversationManager.logMessage(userPhoneId, despachoNombre, respuestaFotomultas, false);
            
            // Enviar imagen ejemplo de fotomulta
            setTimeout(async () => {
                if (global.imageHelper) {
                    await global.imageHelper.sendFineExample(message.from);
                    console.log('📸 Imagen ejemplo de fotomulta enviada');
                }
            }, 2000);
            
            return;
        }
        
        // CASO ESPECIAL: Usuario seleccionó OPCIÓN 02 - DERECHO LABORAL
        if (menuOption === '02' || menuOption === '2' || detectedIntent === 'derecho_laboral') {
            console.log('💼 Opción 02: DERECHO LABORAL - Enviando respuesta específica');
            
            const respuestaLaboral = `💼 *DERECHO LABORAL*\n\n` +
                `Te ayudamos con:\n\n` +
                `📋 *SERVICIOS:*\n` +
                `• Despidos injustificados\n` +
                `• Reclamación de prestaciones\n` +
                `• Liquidaciones y finiquitos\n` +
                `• Demandas laborales\n` +
                `• Riesgos de trabajo\n` +
                `• Asesoría en contratos\n\n` +
                `💰 *INVERSIÓN:*\n` +
                `Consulta inicial: GRATIS\n` +
                `Honorarios: Según el caso\n\n` +
                `📍 *¿Quieres agendar una cita?*\n` +
                `Escribe "CITA" o llámanos al:\n` +
                `📱 +52 477 724 4259`;
            
            await simulateTyping(chat, 2);
            await message.reply(respuestaLaboral);
            conversationManager.logMessage(userPhoneId, despachoNombre, respuestaLaboral, false);
            
            return;
        }
        
        // CASO ESPECIAL: Usuario seleccionó OPCIÓN 03 - ASUNTOS FAMILIARES
        if (menuOption === '03' || menuOption === '3' || detectedIntent === 'asuntos_familiares') {
            console.log('👨‍👩‍👧‍👦 Opción 03: ASUNTOS FAMILIARES - Enviando respuesta específica');
            
            const respuestaFamiliar = `👨‍👩‍👧‍👦 *ASUNTOS FAMILIARES*\n\n` +
                `Te ayudamos con:\n\n` +
                `📋 *SERVICIOS:*\n` +
                `• Divorcios (necesario y voluntario)\n` +
                `• Pensión alimenticia\n` +
                `• Custodia de menores\n` +
                `• Régimen de visitas\n` +
                `• Testamentos\n` +
                `• Adopciones\n\n` +
                `💰 *INVERSIÓN:*\n` +
                `Consulta inicial: GRATIS\n` +
                `Honorarios: Según el trámite\n\n` +
                `📍 *¿Quieres agendar una cita?*\n` +
                `Escribe "CITA" o llámanos al:\n` +
                `📱 +52 477 724 4259`;
            
            await simulateTyping(chat, 2);
            await message.reply(respuestaFamiliar);
            conversationManager.logMessage(userPhoneId, despachoNombre, respuestaFamiliar, false);
            
            return;
        }
        
        // CASO ESPECIAL: Usuario seleccionó OPCIÓN 04 - CONTRATOS CIVILES
        if (menuOption === '04' || menuOption === '4' || detectedIntent === 'contratos_civiles') {
            console.log('📄 Opción 04: CONTRATOS CIVILES - Enviando respuesta específica');
            
            const respuestaContratos = `📄 *CONTRATOS CIVILES*\n\n` +
                `Te ayudamos con:\n\n` +
                `📋 *SERVICIOS:*\n` +
                `• Elaboración de contratos\n` +
                `• Compraventa de inmuebles\n` +
                `• Arrendamiento\n` +
                `• Contratos mercantiles\n` +
                `• Revisión de documentos\n` +
                `• Juicios civiles\n\n` +
                `💰 *INVERSIÓN:*\n` +
                `Consulta inicial: GRATIS\n` +
                `Honorarios: Según el servicio\n\n` +
                `📍 *¿Quieres agendar una cita?*\n` +
                `Escribe "CITA" o llámanos al:\n` +
                `📱 +52 477 724 4259`;
            
            await simulateTyping(chat, 2);
            await message.reply(respuestaContratos);
            conversationManager.logMessage(userPhoneId, despachoNombre, respuestaContratos, false);
            
            return;
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
