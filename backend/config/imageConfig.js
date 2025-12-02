const path = require('path');

/**
 * CONFIGURACIÓN DE IMÁGENES - JPS DESPACHO JURÍDICO PROFESIONAL
 * 
 * Este archivo mapea cada situación del bot con su imagen correspondiente.
 * Todas las rutas son relativas a la carpeta storage/images/marketing/
 */

const IMAGES = {
    // ==========================================
    // 🏢 LOGOS Y BRANDING
    // ==========================================
    LOGO_PRINCIPAL: path.join(__dirname, '../../storage/images/marketing/logos/logo_principal.png'),
    LOGO_HORIZONTAL: path.join(__dirname, '../../storage/images/marketing/logos/logo_horizontal.png'),
    LOGO_ICONO: path.join(__dirname, '../../storage/images/marketing/logos/logo_icono.png'),
    FIRMA_DIGITAL: path.join(__dirname, '../../storage/images/marketing/logos/firma_digital.png'),
    
    // ==========================================
    // 👋 BIENVENIDA Y PRESENTACIÓN
    // ==========================================
    BIENVENIDA: path.join(__dirname, '../../storage/images/marketing/bienvenida/bienvenida_principal.jpg'),
    CONTACTO: path.join(__dirname, '../../storage/images/marketing/bienvenida/tarjeta_contacto.jpg'),
    HORARIOS: path.join(__dirname, '../../storage/images/marketing/bienvenida/horarios_atencion.jpg'),
    OFICINA: path.join(__dirname, '../../storage/images/marketing/bienvenida/despacho_oficina.jpg'),
    
    // ==========================================
    // ⚖️ SERVICIOS LEGALES
    // ==========================================
    IMPUGNACION_MULTAS: path.join(__dirname, '../../storage/images/marketing/servicios/impugnacion_multas.jpg'),
    DIVORCIOS: path.join(__dirname, '../../storage/images/marketing/servicios/divorcios.jpg'),
    TESTAMENTOS: path.join(__dirname, '../../storage/images/marketing/servicios/testamentos.jpg'),
    LABORALES: path.join(__dirname, '../../storage/images/marketing/servicios/juicios_laborales.jpg'),
    PENAL: path.join(__dirname, '../../storage/images/marketing/servicios/defensa_penal.jpg'),
    PRECIOS: path.join(__dirname, '../../storage/images/marketing/servicios/tabla_precios.jpg'),
    
    // ==========================================
    // 🏆 CASOS DE ÉXITO Y TESTIMONIOS
    // ==========================================
    MULTA_CANCELADA: path.join(__dirname, '../../storage/images/marketing/casos_exito/multa_cancelada_ejemplo.jpg'),
    ESTADISTICAS: path.join(__dirname, '../../storage/images/marketing/casos_exito/estadisticas_2024.jpg'),
    TESTIMONIO_1: path.join(__dirname, '../../storage/images/marketing/casos_exito/testimonio_1.jpg'),
    TESTIMONIO_2: path.join(__dirname, '../../storage/images/marketing/casos_exito/testimonio_2.jpg'),
    ANTES_DESPUES: path.join(__dirname, '../../storage/images/marketing/casos_exito/antes_despues.jpg'),
};

/**
 * TEXTOS SUGERIDOS PARA CADA IMAGEN
 * Usa estos captions al enviar las imágenes
 */
const CAPTIONS = {
    BIENVENIDA: 
        '⚖️ *BIENVENIDO A JPS DESPACHO JURÍDICO*\n\n' +
        'Defendemos tus derechos con experiencia y profesionalismo.',
    
    IMPUGNACION_MULTAS:
        '✅ *MULTA RECIBIDA - ANÁLISIS CONFIRMADO*\n\n' +
        'El Lic. José Patricio revisará tu caso.\n\n' +
        '💰 *INVERSIÓN:* $2,500 MXN\n' +
        '📊 *TASA DE ÉXITO:* 97% (330/340 casos ganados)\n' +
        '⏱️ *PROCESO:* 4-6 meses\n\n' +
        '📋 *PARA INICIAR NECESITAS:*\n' +
        '1️⃣ Entregar multa ORIGINAL en físico\n' +
        '2️⃣ Pago de $2,500 MXN\n' +
        '3️⃣ Copia de licencia y tarjeta de circulación\n\n' +
        '📍 *Ubicación:* León, Guanajuato\n' +
        '📱 *Contacto:* +52 477 724 4259\n\n' +
        '¿Deseas agendar cita para entregar documentos?',
    
    MULTA_CANCELADA:
        '✅ *ASÍ SE VE UNA MULTA CANCELADA*\n\n' +
        '🎯 Caso real de esta semana\n' +
        '⚖️ Resultado: CANCELADA\n' +
        '💰 Cliente ahorró: $3,200 MXN\n' +
        '💸 Inversión: $1,600 MXN\n\n' +
        '¿La tuya es similar? ¡Podemos ganarla!',
    
    ESTADISTICAS:
        '📊 *NUESTROS RESULTADOS 2024*\n\n' +
        '✅ 2573 Multas Impugnadas\n' +
        '🎯 99% Casos Ganados\n' +
        '💰 $384,000 MXN Ahorrados a Clientes\n\n' +
        'Los números no mienten.\n' +
        '¿Tú también quieres ganar tu caso?',
    
    CONTACTO:
        '📱 *CONTACTO JPS DESPACHO JURÍDICO*\n\n' +
        '👨‍⚖️ Lic. José Patricio Sánchez\n' +
        '📞 +52 477 724 4259\n' +
        '📍 León, Guanajuato\n' +
        '⏰ Lun-Vie: 9:00 - 18:00\n' +
        '⏰ Sáb: 9:00 - 14:00\n\n' +
        'Atención personalizada y profesional.',
    
    PRECIOS:
        '💰 *NUESTROS SERVICIOS*\n\n' +
        'Precios transparentes y competitivos.\n' +
        'Primera consulta para revisar tu caso.\n\n' +
        '¿Qué servicio necesitas?',
    
    // DIVORCIOS:
    //     '💔 *DIVORCIOS*\n\n' +
    //     '✅ Divorcio Express: $12,000 MXN\n' +
    //     '   (3-4 meses, mutuo acuerdo)\n\n' +
    //     '⚔️ Divorcio Contencioso: Desde $18,000\n' +
    //     '   (8-12 meses, con disputa)\n\n' +
    //     '📋 Primera consulta: $1,200 MXN\n\n' +
    //     '¿Cuál es tu situación?',
    
    TESTAMENTOS:
        '📜 *TESTAMENTOS*\n\n' +
        '✅ Testamento Completo: $4,500 MXN\n\n' +
        'Incluye:\n' +
        '• Asesoría legal completa\n' +
        '• Elaboración del documento\n' +
        '• Trámite notarial\n' +
        '• Registro público\n\n' +
        '⏱️ Listo en 2 semanas\n\n' +
        'Protege a tu familia hoy.',
};

/**
 * MAPEO DE PALABRAS CLAVE → IMAGEN
 * Detecta qué imagen enviar según el contexto
 */
const KEYWORD_IMAGE_MAP = {
    multa: 'IMPUGNACION_MULTAS',
    infraccion: 'IMPUGNACION_MULTAS',
    transito: 'IMPUGNACION_MULTAS',
    fotomulta: 'IMPUGNACION_MULTAS',
    
    divorcio: 'DIVORCIOS',
    separacion: 'DIVORCIOS',
    matrimonio: 'DIVORCIOS',
    
    testamento: 'TESTAMENTOS',
    herencia: 'TESTAMENTOS',
    sucesion: 'TESTAMENTOS',
    
    patron: 'LABORALES',
    trabajo: 'LABORALES',
    despido: 'LABORALES',
    liquidacion: 'LABORALES',
    
    penal: 'PENAL',
    delito: 'PENAL',
    acusacion: 'PENAL',
    
    precio: 'PRECIOS',
    costo: 'PRECIOS',
    cuanto: 'PRECIOS',
    
    contacto: 'CONTACTO',
    ubicacion: 'CONTACTO',
    direccion: 'CONTACTO',
    horario: 'HORARIOS',
};

module.exports = {
    IMAGES,
    CAPTIONS,
    KEYWORD_IMAGE_MAP
};
