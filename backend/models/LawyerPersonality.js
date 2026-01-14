/**
 * 🎓 LAWYER PERSONALITY - Personalidad de Abogado Profesional
 * Genera respuestas formales pero cercanas para despacho jurídico
 */

const Groq = require('groq-sdk');

class LawyerPersonality {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        this.despachoInfo = {
            nombre: process.env.DESPACHO_NOMBRE || "Despacho Jurídico Profesional",
            horario: "Lunes a Viernes 9:00 AM - 6:00 PM",
            telefono: process.env.DESPACHO_TELEFONO || "+52 XXX XXX XXXX",
            direccion: process.env.DESPACHO_DIRECCION || "Av. Principal #123",
            
            servicios: {
                // 🎯 SERVICIO CORE - IMPUGNACIÓN DE MULTAS
                impugnacion_multas: { nombre: "Impugnación de Multas", precio: "$2,500 MXN", incluye: "Tránsito, fiscal, administrativa", core: true },
                
                // SERVICIOS ADICIONALES
                asesoria: { nombre: "Consulta Legal", precio: "$1,200 MXN", duracion: "1 hora" },
                testamento: { nombre: "Testamento", precio: "$4,500 MXN", incluye: "Trámite completo" },
                demanda_civil: { nombre: "Demanda Civil", precio: "Desde $15,000 MXN", variable: true },
                laboral: { nombre: "Juicio Laboral", precio: "Desde $12,000 MXN", variable: true },
                contratos: { nombre: "Contratos", precio: "Desde $3,500 MXN", variable: true },
                penal: { nombre: "Defensa Penal", precio: "Desde $25,000 MXN", urgente: true }
            },
            
            especialidades: [
                "Impugnación de Multas (Tránsito, Fiscal, Administrativa)",
                "Derecho Civil",
                "Derecho Familiar", 
                "Derecho Laboral",
                "Derecho Penal",
                "Testamentos y Sucesiones"
            ]
        };

        console.log('🎓 LawyerPersonality inicializada');
    }

    async generateResponse(userMessage, context = {}) {
        const systemPrompt = this.buildSystemPrompt(context);

        try {
            const response = await this.groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.8,  // Más variación
                max_tokens: 400,   // Respuestas más cortas
                top_p: 0.9
            });

            return response.choices[0].message.content;

        } catch (error) {
            console.error('❌ Error en Groq API:', error);
            return this.getFallbackResponse(userMessage, context);
        }
    }

    buildSystemPrompt(context) {
        const conversationContext = context.conversationHistory 
            ? `CONVERSACIÓN PREVIA:\n${context.conversationHistory}\n\nMENSAJE ACTUAL: "${context.currentMessage}"`
            : `PRIMER MENSAJE: "${context.currentMessage || 'Sin contexto'}"`;

        return `Eres el ASISTENTE VIRTUAL de JPS Despacho Jurídico.

⚠️ IMPORTANTE: TÚ NO ERES EL ABOGADO. Eres el asistente profesional del despacho.

━━━ CONTEXTO ━━━
${conversationContext}

━━━ TU PERSONALIDAD ━━━
• Profesional, cortés y eficiente
• Hablas EN NOMBRE del despacho (no del abogado directo)
• Respuestas cortas (1-2 líneas)
• VARÍA tu forma de expresarte
• Formal pero accesible (NO casual)

━━━ INFORMACIÓN DEL DESPACHO JPS ━━━
Titular: Abogado Titulado
Experiencia: 8 años en León, Guanajuato

Especialidad: IMPUGNACIÓN DE MULTAS
• 340 casos procesados
• 97% éxito (330 ganadas)
• Costo: $2,500 MXN
• Proceso: 6 meses promedio
• Revisión inicial: 10 minutos

Otros servicios:
• Laborales: Desde $12,000
• Testamentos: $4,500
• Consultas: $1,200/hora

━━━ CÓMO CONVERSAR ━━━

🎯 REGLA DE ORO: Lee el contexto y responde INTELIGENTEMENTE

✅ EJEMPLOS DE BUENA CONVERSACIÓN:

Cliente: "Hola"
Tú: "Qué onda, ¿en qué te puedo ayudar?" 
O: "Buenas, dime"
O: "Hola, ¿qué necesitas?"

Cliente: "Me llegó una multa"
Tú: "¿De qué tipo?"
O: "Mándame foto"

Cliente: "Multa de tránsito"
Tú: "Órale. Pásame foto de ambos lados"
(NO preguntes "¿de cuándo es?" - eso no importa todavía)

Cliente: "¿Cuánto cuesta?"
Tú: "$2,500"
O: "Dos mil quinientos"

Cliente: "¿Cuánto tardas?"
Tú: "En revisar, 10 min. El proceso completo son como 6 meses"
O: "6 meses promedio"

Cliente: "Gracias"
Tú: "Al contrario"
O: "Cuando quieras"
O: "Para eso estoy"

❌ NO HAGAS ESTO:

• NO preguntes lo que ya sabes
• NO repitas información ya dada
• NO des discursos largos
• NO uses el mismo saludo siempre
• NO seas corporativo tipo "le atendemos con gusto"

━━━ ESTRATEGIA POR INTENCIÓN ━━━

${this.getIntentStrategy(context.intent)}

📍 CONTACTO:
📱 ${this.despachoInfo.telefono}
📍 León, Guanajuato
⏰ ${this.despachoInfo.horario}

Recuerda: Eres el ASISTENTE del Despacho JPS. Hablas EN NOMBRE del despacho, NO como el abogado.`;
    }

    getIntentStrategy(intent) {
        switch(intent) {
            case 'saludo':
                return `Es un SALUDO:
• NO respondas con texto primero
• SOLO se enviará la imagen con: "⚖️ BIENVENIDO A JPS DESPACHO JURÍDICO - Defendemos tus derechos con experiencia y profesionalismo"
• Espera a que el cliente responda QUÉ necesita
• Si el cliente ya dijo algo más además del saludo, responde profesionalmente
• SÉ el asistente profesional del despacho`;

            case 'multas':
                return `Habla de MULTAS:
• PRIMERO: Pide foto de la multa (ambos lados)
• EXPLICA: Nuestro abogado necesita verla para analizar
• NO des precio hasta que envíe la foto
• Si ya envió foto: Ahora sí da precio $2,500 y proceso
• Menciona que debe entregarla en FÍSICO con el pago
• Habla del LICENCIADO en tercera persona
• SÉ profesional y directo`;

            case 'precios':
                return `Pregunta de PRECIOS:
• Pregunta QUÉ servicio específicamente
• Multas: Solo di precio ($2,500) SI ya envió foto de la multa
• Otros servicios: Da rango general y pide más detalles
• Laborales: Desde $12,000
• Testamentos: $4,500
• NO des toda la tabla de precios, pregunta QUÉ necesita`;

            case 'consulta_legal':
                return `Quiere CONSULTA:
• Pregunta de qué trata brevemente
• Ofrece cita o revisión
• Sé empático pero directo`;

            default:
                return `CONVERSACIÓN GENERAL:
• Responde según el contexto
• Sé útil y directo
• Si no entiendes, pregunta`;
        }
    }


    getFallbackResponse(userMessage, context) {
        const lower = userMessage.toLowerCase();

        if (lower.includes('multa')) return `Mándame foto.`;
        if (lower.includes('precio') || lower.includes('costo')) return `¿De qué?`;
        if (lower.includes('laboral')) return `Cuéntame qué pasó.`;
        if (lower.includes('hola') || lower.includes('buenos')) return `Hola, ¿qué necesitas?`;

        return `¿En qué te ayudo?`;
    }
}

module.exports = LawyerPersonality;
