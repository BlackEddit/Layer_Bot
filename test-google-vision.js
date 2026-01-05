/**
 * ═══════════════════════════════════════════════════════════════
 * 🧪 SCRIPT DE PRUEBA - ANALIZAR MULTAS CON GOOGLE VISION
 * ═══════════════════════════════════════════════════════════════
 * 
 * Uso:
 * node test-google-vision.js ruta/a/foto-multa.jpg
 */

require('dotenv').config();
const GoogleVisionMultaAnalyzer = require('./backend/models/GoogleVisionMultaAnalyzer');
const path = require('path');
const fs = require('fs');

console.log('═══════════════════════════════════════════════════════');
console.log('🧪 TEST - GOOGLE VISION MULTAS');
console.log('═══════════════════════════════════════════════════════\n');

// Obtener ruta de la imagen desde argumentos
const imagePath = process.argv[2];

if (!imagePath) {
    console.error('❌ ERROR: Debes proporcionar la ruta de una imagen\n');
    console.log('📝 Uso:');
    console.log('   node test-google-vision.js ruta/a/foto.jpg');
    console.log('\n💡 Ejemplo:');
    console.log('   node test-google-vision.js "storage/images/received/WhatsApp Image 2026-01-02 at 3.33.52 PM.jpeg"');
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
    
    console.log('⏳ Analizando imagen con Google Vision OCR...\n');
    
    try {
        const resultado = await analyzer.analizarMulta(fullPath);
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 RESULTADO DEL ANÁLISIS');
        console.log('═══════════════════════════════════════════════════════\n');
        
        if (resultado.exito) {
            console.log('✅ ANÁLISIS EXITOSO\n');
            
            // Contar campos obtenidos
            const camposRequeridos = [
                'nombre_infraccionado', 'folio', 'fecha_infraccion', 'placas', 
                'marca', 'linea', 'nombre_policia', 'numero_identificacion',
                'delegacion', 'turno', 'sector', 'fecha_conocimiento'
            ];
            
            const datos = resultado.datos;
            const camposObtenidos = camposRequeridos.filter(campo => 
                datos[campo] && datos[campo] !== 'No especificado'
            );
            
            const porcentaje = Math.round((camposObtenidos.length / camposRequeridos.length) * 100);
            
            // Mostrar resumen de campos
            console.log('📊 CAMPOS OBTENIDOS: ' + camposObtenidos.length + '/12 (' + porcentaje + '%)');
            console.log('─────────────────────────────────────────────────────');
            
            // Mostrar todos los campos con estado
            console.log('\n📋 DATOS EXTRAÍDOS (12 campos requeridos):');
            console.log('─────────────────────────────────────────────────────');
            
            const mostrarCampo = (icono, nombre, valor) => {
                const estado = valor && valor !== 'No especificado' ? '✅' : '❌';
                console.log(`  ${estado} ${icono} ${nombre}: ${valor}`);
            };
            
            mostrarCampo('👤', 'Nombre infraccionado', datos.nombre_infraccionado);
            mostrarCampo('📄', 'Folio', datos.folio);
            mostrarCampo('📅', 'Fecha infracción', datos.fecha_infraccion);
            mostrarCampo('🚗', 'Placas', datos.placas);
            mostrarCampo('🏢', 'Marca', datos.marca);
            mostrarCampo('📋', 'Línea', datos.linea);
            mostrarCampo('👮', 'Nombre policía', datos.nombre_policia);
            mostrarCampo('🆔', 'Núm. identificación', datos.numero_identificacion);
            mostrarCampo('🏛️', 'Delegación', datos.delegacion);
            mostrarCampo('🕐', 'Turno', datos.turno);
            mostrarCampo('📍', 'Sector', datos.sector);
            mostrarCampo('📆', 'Fecha conocimiento', datos.fecha_conocimiento);
            
            console.log('\n📝 DATOS ADICIONALES:');
            console.log('─────────────────────────────────────────────────────');
            if (datos.hora) console.log(`  🕐 Hora:         ${datos.hora}`);
            if (datos.lugar) console.log(`  📍 Lugar:        ${datos.lugar}`);
            if (datos.tipo_infraccion) console.log(`  ⚠️  Infracción:  ${datos.tipo_infraccion}`);
            if (datos.articulo) console.log(`  📖 Artículo:     ${datos.articulo}`);
            if (datos.monto) console.log(`  💰 Monto:        ${datos.monto}`);
            
            console.log('\n📊 CONFIANZA DEL ANÁLISIS:');
            console.log('─────────────────────────────────────────────────────');
            console.log(`  ${resultado.confianza}% (Google Vision OCR)`);
            
            console.log('\n📱 MENSAJE PARA WHATSAPP:');
            console.log('─────────────────────────────────────────────────────');
            console.log(resultado.mensaje);
            
            console.log('\n📄 TEXTO COMPLETO EXTRAÍDO (primeros 500 chars):');
            console.log('─────────────────────────────────────────────────────');
            console.log(resultado.textoCompleto.substring(0, 500) + '...');
            
        } else {
            console.log('❌ ERROR EN EL ANÁLISIS\n');
            console.log(`Mensaje: ${resultado.error || resultado.mensaje}`);
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
});
