/**
 * ═══════════════════════════════════════════════════════════════
 * 🧪 SCRIPT DE PRUEBA - ANALIZAR FOTOS DE MULTAS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Uso:
 * node test-multa-analyzer.js ruta/a/foto-multa.jpg
 */

require('dotenv').config();
const GoogleVisionMultaAnalyzer = require('./backend/models/GoogleVisionMultaAnalyzer');
const path = require('path');
const fs = require('fs');

console.log('═══════════════════════════════════════════════════════');
console.log('🧪 TEST - ANALIZADOR DE MULTAS');
console.log('═══════════════════════════════════════════════════════\n');

// Obtener ruta de la imagen desde argumentos
const imagePath = process.argv[2];

if (!imagePath) {
    console.error('❌ ERROR: Debes proporcionar la ruta de una imagen\n');
    console.log('📝 Uso:');
    console.log('   node test-multa-analyzer.js ruta/a/foto.jpg');
    console.log('\n💡 Ejemplo:');
    console.log('   node test-multa-analyzer.js storage/images/received/multa-ejemplo.jpg');
    process.exit(1);
}

// Verificar que el archivo existe
const fullPath = path.resolve(imagePath);
if (!fs.existsSync(fullPath)) {
    console.error(`❌ ERROR: El archivo no existe: ${fullPath}`);
    process.exit(1);
}

console.log(`📁 Archivo: ${path.basename(fullPath)}`);
console.log(`📍 Ruta completa: ${fullPath}`);
console.log(`📏 Tamaño: ${(fs.statSync(fullPath).size / 1024).toFixed(2)} KB\n`);

// Analizar la multa
async function test() {
    const analyzer = new GoogleVisionMultaAnalyzer();
    
    console.log('⏳ Analizando imagen...\n');
    
    try {
        const resultado = await analyzer.analizarMulta(fullPath);
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 RESULTADO DEL ANÁLISIS');
        console.log('═══════════════════════════════════════════════════════\n');
        
        if (resultado.exito) {
            console.log('✅ ANÁLISIS EXITOSO\n');
            
            // Mostrar datos extraídos
            console.log('📋 DATOS EXTRAÍDOS:');
            console.log('─────────────────────────────────────────────────────');
            
            const datos = resultado.datos;
            if (datos.folio) console.log(`  📄 Folio:        ${datos.folio}`);
            if (datos.fecha) console.log(`  📅 Fecha:        ${datos.fecha}`);
            if (datos.hora) console.log(`  🕐 Hora:         ${datos.hora}`);
            if (datos.placas) console.log(`  🚗 Placas:       ${datos.placas}`);
            if (datos.lugar) console.log(`  📍 Lugar:        ${datos.lugar}`);
            if (datos.tipo_infraccion) console.log(`  ⚠️  Infracción:  ${datos.tipo_infraccion}`);
            if (datos.articulo) console.log(`  📖 Artículo:     ${datos.articulo}`);
            if (datos.monto) console.log(`  💰 Monto:        ${datos.monto}`);
            if (datos.autoridad) console.log(`  👮 Autoridad:    ${datos.autoridad}`);
            if (datos.oficial && datos.oficial !== 'No especificado') console.log(`  👤 Oficial:      ${datos.oficial}`);
            if (datos.observaciones && datos.observaciones !== 'No especificado') console.log(`  📝 Obs:          ${datos.observaciones}`);
            
            console.log('\n📊 CONFIANZA DEL ANÁLISIS:');
            console.log('─────────────────────────────────────────────────────');
            console.log(`  ${resultado.confianza}% (Google Vision OCR)`);
            
            console.log('\n📱 MENSAJE PARA WHATSAPP:');
            console.log('─────────────────────────────────────────────────────');
            console.log(resultado.mensaje);
            
            console.log('\n📄 TEXTO COMPLETO EXTRAÍDO:');
            console.log('─────────────────────────────────────────────────────');
            console.log(resultado.textoCompleto.substring(0, 500) + '...');
                console.log('\n✅ Confianza alta. Datos probablemente correctos.');
            }
            
            // Mostrar texto completo extraído
            if (resultado.rawText) {
                console.log('\n📝 TEXTO COMPLETO EXTRAÍDO:');
                console.log('─────────────────────────────────────────────────────');
                console.log(resultado.rawText);
            }
            
            // Mostrar reporte formateado para WhatsApp
            console.log('\n💬 MENSAJE PARA WHATSAPP:');
            console.log('─────────────────────────────────────────────────────');
            console.log(analyzer.generarReporte(resultado));
            
        } else {
            console.log('❌ ERROR EN EL ANÁLISIS\n');
            console.log(`Mensaje: ${resultado.error}`);
        }
        
        console.log('\n═══════════════════════════════════════════════════════');
        
    } catch (error) {
        console.error('\n❌ ERROR INESPERADO:');
        console.error(error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
    }
}

// Ejecutar test
test().then(() => {
    console.log('\n✅ Test completado');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
});
