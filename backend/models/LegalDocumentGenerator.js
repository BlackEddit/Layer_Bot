const { Document, Paragraph, TextRun, AlignmentType, HeadingLevel } = require('docx');
const fs = require('fs').promises;
const path = require('path');

/**
 * GENERADOR DE DOCUMENTOS LEGALES
 * Genera demandas contenciosas administrativas con los datos de la multa
 */
class LegalDocumentGenerator {
    constructor() {
        this.outputDir = path.join(__dirname, '../../storage/documents');
        this.ensureOutputDir();
    }

    async ensureOutputDir() {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
        } catch (error) {
            console.error('Error creando directorio de documentos:', error);
        }
    }

    /**
     * Calcula la fecha de conocimiento (3 días hábiles antes de hoy)
     */
    getFechaConocimiento() {
        const hoy = new Date();
        const fechaConocimiento = new Date(hoy);
        let diasHabilesRestantes = 3;
        
        // Retroceder 3 días hábiles (lunes a viernes)
        while (diasHabilesRestantes > 0) {
            fechaConocimiento.setDate(fechaConocimiento.getDate() - 1);
            const diaSemana = fechaConocimiento.getDay(); // 0=domingo, 6=sábado
            
            // Si no es sábado ni domingo, contar como día hábil
            if (diaSemana !== 0 && diaSemana !== 6) {
                diasHabilesRestantes--;
            }
        }
        
        const dia = fechaConocimiento.getDate();
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const mes = meses[fechaConocimiento.getMonth()];
        const año = fechaConocimiento.getFullYear();
        
        return `${dia} de ${mes} de ${año}`;
    }

    /**
     * Formatea la fecha de infracción
     */
    formatearFecha(fechaISO) {
        if (!fechaISO) return 'No especificado';
        
        const fecha = new Date(fechaISO);
        const dia = fecha.getDate();
        const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
        const mes = meses[fecha.getMonth()];
        const año = fecha.getFullYear();
        
        return `${dia} DE ${mes} DE ${año}`;
    }

    /**
     * Genera documento de demanda contenciosa administrativa
     */
    async generarDemanda(datosMulta, nombreInfractor) {
        const fechaConocimiento = this.getFechaConocimiento();
        const fechaInfraccion = this.formatearFecha(datosMulta.fechaInfraccion);
        
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    // Encabezado
                    new Paragraph({
                        text: 'H. JUEZ ADMINISTRATIVO MUNICIPAL DE LEÓN, GTO.',
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: 'PRESENTE',
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 400 }
                    }),

                    // Promovente
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `C. ${nombreInfractor.toUpperCase()} `,
                                bold: false
                            }),
                            new TextRun({
                                text: 'por mi propio derecho, señalando para oír y recibir notificaciones en '
                            }),
                            new TextRun({
                                text: 'BRISAS DE SAN FELIPE 254, colonia BRISAS DE SAN NICOLÁS, en León, Gto.',
                                bold: true
                            }),
                            new TextRun({
                                text: '; autorizando en términos del artículo 10 del Código de Procedimiento y Justicia Administrativa para el Estado y los Municipios de Guanajuato (en adelante C. P. J. A.) al '
                            }),
                            new TextRun({
                                text: 'C. LIC. JOSÉ PATRICIO SÁNCHEZ MARTÍNEZ',
                                bold: true
                            }),
                            new TextRun({
                                text: '; y para oír y recibir notificaciones a la '
                            }),
                            new TextRun({
                                text: 'C. MARIANA GUADALUPE SÁNCHEZ BARAJAS',
                                bold: true
                            }),
                            new TextRun({
                                text: '; solicitando se notifique en el correo electrónico '
                            }),
                            new TextRun({
                                text: 'lic.patriciosanchez@yahoo.com',
                                bold: true
                            }),
                            new TextRun({
                                text: ', ante Usted, con el debido respeto comparezco para exponer:'
                            })
                        ],
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // Introducción
                    new Paragraph({
                        text: 'Se promueve demanda contencioso administrativa en la vía sumaria contra el siguiente acto administrativo:',
                        spacing: { after: 200 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // ACTO IMPUGNADO
                    new Paragraph({
                        text: 'ACTO IMPUGNADO',
                        bold: true,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: '1.- ACTA DE INFRACCIÓN CAPTADA A TRAVÉS DE DISPOSITIVOS TECNOLÓGICOS DE FOTOMULTAS folio '
                            }),
                            new TextRun({
                                text: datosMulta.folio || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', de fecha '
                            }),
                            new TextRun({
                                text: fechaInfraccion,
                                bold: true
                            }),
                            new TextRun({
                                text: ', emitida por C. Policía Vial '
                            }),
                            new TextRun({
                                text: datosMulta.nombreOficial || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', adscrito a la '
                            }),
                            new TextRun({
                                text: `${datosMulta.delegacion || 'No especificado'} ${datosMulta.sector || ''} ${datosMulta.turno || ''}`,
                                bold: true
                            }),
                            new TextRun({
                                text: ', de la Dirección de Policía Vial de León, Guanajuato; con número de empleado '
                            }),
                            new TextRun({
                                text: datosMulta.idOficial || 'No especificado',
                                bold: true
                            })
                        ],
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // AUTORIDADES DEMANDADAS
                    new Paragraph({
                        text: 'AUTORIDADES DEMANDADAS:',
                        bold: true,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: 'I.- El C. Policía Vial que emitió el acto impugnado.',
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    new Paragraph({
                        text: 'En la presente causa contenciosa administrativa, no existe persona alguna que tenga un derecho incompatible con la pretensión intentada',
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // PRETENSIÓN
                    new Paragraph({
                        text: 'PRETENSIÓN INTENTADA EN TÉRMINOS DEL ARTÍCULO 255:',
                        bold: true,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'I.- Se declare la nulidad del ACTA DE INFRACCIÓN CAPTADA A TRAVÉS DE DISPOSITIVOS TECNOLÓGICOS DE FOTOMULTAS folio '
                            }),
                            new TextRun({
                                text: datosMulta.folio || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', de fecha '
                            }),
                            new TextRun({
                                text: fechaInfraccion,
                                bold: true
                            }),
                            new TextRun({
                                text: ', emitida por C. Policía Vial '
                            }),
                            new TextRun({
                                text: datosMulta.nombreOficial || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', adscrito a la '
                            }),
                            new TextRun({
                                text: `${datosMulta.delegacion || 'No especificado'} ${datosMulta.sector || ''} ${datosMulta.turno || ''}`,
                                bold: true
                            }),
                            new TextRun({
                                text: ', de la Dirección de Policía Vial de León, Guanajuato; con número de empleado '
                            }),
                            new TextRun({
                                text: datosMulta.idOficial || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ';'
                            })
                        ],
                        spacing: { after: 200 },
                        alignment: AlignmentType.JUSTIFIED
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'II.- Se eliminen los registros de las actas de infracción relacionados con las placas de circulación del vehículo automotor placas de circulación '
                            }),
                            new TextRun({
                                text: datosMulta.placas || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ' marca '
                            }),
                            new TextRun({
                                text: datosMulta.marca || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', línea '
                            }),
                            new TextRun({
                                text: datosMulta.linea || 'No especificado',
                                bold: true
                            })
                        ],
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // HECHOS
                    new Paragraph({
                        text: 'HECHOS',
                        bold: true,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `1.- El ${fechaConocimiento} tuve conocimiento del ACTA DE INFRACCIÓN CAPTADA A TRAVÉS DE DISPOSITIVOS TECNOLÓGICOS DE FOTOMULTAS folio `
                            }),
                            new TextRun({
                                text: datosMulta.folio || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', de fecha '
                            }),
                            new TextRun({
                                text: fechaInfraccion,
                                bold: true
                            }),
                            new TextRun({
                                text: ', emitida por la C. Policía Vial '
                            }),
                            new TextRun({
                                text: datosMulta.nombreOficial || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', adscrito a la '
                            }),
                            new TextRun({
                                text: `${datosMulta.delegacion || 'No especificado'} ${datosMulta.sector || ''} ${datosMulta.turno || ''}`,
                                bold: true
                            }),
                            new TextRun({
                                text: ', de la Dirección de Policía Vial de León, Guanajuato; con número de empleado '
                            }),
                            new TextRun({
                                text: datosMulta.idOficial || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ' que se impugnan, las cuales están dirigidas a mi nombre, ya que se dirigen al propietario del vehículo automotor con placas de circulación '
                            }),
                            new TextRun({
                                text: datosMulta.placas || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', marca '
                            }),
                            new TextRun({
                                text: datosMulta.marca || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', línea '
                            }),
                            new TextRun({
                                text: datosMulta.linea || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: '.'
                            })
                        ],
                        spacing: { after: 200 },
                        alignment: AlignmentType.JUSTIFIED
                    }),
                    new Paragraph({
                        text: '2.- Toda vez que no estamos de acuerdo con la infracción que se imputa; se niega lisa y llanamente haber cometido la infracción, y se esgrimen los siguientes conceptos de impugnación.',
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // CONCEPTOS DE IMPUGNACIÓN
                    new Paragraph({
                        text: 'CONCEPTOS DE IMPUGNACIÓN',
                        bold: true,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: 'ÚNICO.- EL ACTO IMPUGNADO CARECE DE LOS ELEMENTOS DE VALIDEZ PREVISTOS EN EL ARTÍCULO 137 DEL C. P. J. A., YA QUE ESTABLECE EL FUNDAMENTO LEGAL QUE OTORGA COMPETENCIA POR MATERIA Y GRADO, FUNDAMENTO DE LA FACULTAD; Y CARECE DE LA DEBIDA FUNDAMENTACIÓN Y MOTIVACIÓN.',
                        bold: true,
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // Premisa mayor
                    new Paragraph({
                        text: 'Premisa mayor',
                        bold: true,
                        italics: true,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: 'El artículo 137, fracción V, del Código de Procedimiento y Justicia Administrativa para el Estado y los Municipios de Guanajuato, señala:',
                        spacing: { after: 200 },
                        alignment: AlignmentType.JUSTIFIED
                    }),
                    new Paragraph({
                        text: 'Artículo 137. Son elementos de validez del acto administrativo: […] V. Constar por escrito, indicar la autoridad de la que emane y contener la firma autógrafa o electrónica del servidor público, salvo en aquellos casos en que se trate de negativa o afirmativa fictas, o el ordenamiento aplicable autorice una forma distinta de emisión, inclusive medios electrónicos; […]',
                        italics: true,
                        spacing: { after: 200 },
                        alignment: AlignmentType.JUSTIFIED
                    }),
                    new Paragraph({
                        text: 'Para que el acto tenga validez, debe ser realizado por autoridad facultada legalmente para ello, en su relativo ámbito de competencia, por tal motivo, en base a la garantía de exhaustividad es obligación de la autoridad emisora del acto de molestia, fundamentar con precisión y exactitud, su competencia material, territorial y por grado, tal y como lo reconoce La Suprema Corte de Justicia de la Nación en la tesis 2a./J. 115/2005 del nueve de septiembre de dos mil cinco en su ejecutoria en el Semanario Judicial de la Federación y su Gaceta, novena época, tomo XXII, con carácter de Jurisprudencia Administrativa: "COMPETENCIA DE LAS AUTORIDADES ADMINISTRATIVAS. EL MANDAMIENTO ESCRITO QUE CONTIENE EL ACTO DE MOLESTIA A PARTICULARES DEBE FUNDARSE EN EL PRECEPTO LEGAL QUE LES OTORGUE LA ATRIBUCIÓN EJERCIDA, CITANDO EL APARTADO, FRACCIÓN, INCISO O SUBINCISO, Y EN CASO DE QUE NO LOS CONTENGA, SI SE TRATA DE UNA NORMA COMPLEJA, HABRÁ DE TRANSCRIBIRSE LA PARTE CORRESPONDIENTE."',
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // Premisa menor
                    new Paragraph({
                        text: 'Premisa menor',
                        bold: true,
                        italics: true,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: 'De la lectura del acto impugnado se advierte que: 1.- La autoridad omitió circunstanciar debidamente la infracción, porque no establece quien es la persona que cometió la infracción. 2.- Además, omite establecer las circunstancias de tiempo, modo y lugar del momento en que se cometió la infracción, dejándonos en indefensión. 3.- En la foto de la izquierda no se aprecian claramente las placas del vehículo supuestamente captado en infracción, por lo que resulta insuficiente para demostrar la existencia de la infracción. 4.- No se demuestra que las placas que se exhiben en la foto son las mismas del vehículo captado en infracción. 5.- El servidor público, omite fundar su competencia por territorio de manera exacta y exhaustiva al no expresar la norma que le da origen a dicha dependencia, así como el otorgamiento de realizar sus facultades en cierta circunscripción territorial; la cual la encontramos en el artículo 4, fracción III del Reglamento Interior de la Administración Pública Municipal de León, Guanajuato; 6.- La autoridad omite fundar su competencia por materia citando el artículo 98 fracción I del Reglamento Interior de la Administración Pública Municipal de León, Guanajuato; para cumplir correctamente con la garantía de la adecuada y exhaustiva fundamentación de la competencia.',
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // Conclusión
                    new Paragraph({
                        text: 'Conclusión',
                        bold: true,
                        italics: true,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: 'En ese sentido, se niega lisa y llanamente haber cometido la infracción que se me imputa en el acta de infracción impugnada. Además, de los vicios de fundamentación y motivación expuestos se aprecia que esa ACTA DE INFRACCIÓN CAPTADA A TRAVÉS DE DISPOSITIVOS TECNOLÓGICOS DE FOTOMULTAS es ilegal, porque carece de los elementos de validez de los actos administrativos previstos en el artículo 137 del C.P.J.A., por lo que se solicita se declare su nulidad.',
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // SUSPENSIÓN
                    new Paragraph({
                        text: 'SUSPENSIÓN',
                        bold: true,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: 'Se solicita se dicte suspensión para el efecto de que la autoridad se abstenga de iniciar el procedimiento administrativo de ejecución. Resulta procedente la solicitud de suspensión, ya que con su otorgamiento no se está afectando el orden público ni el interés social, con fundamento en lo establecido por los artículos 268 y 269 del C. P. J. A.',
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // PRUEBAS
                    new Paragraph({
                        text: 'PRUEBAS:',
                        bold: true,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: '1.- ACTA DE INFRACCIÓN CAPTADA A TRAVÉS DE DISPOSITIVOS TECNOLÓGICOS DE FOTOMULTAS folio '
                            }),
                            new TextRun({
                                text: datosMulta.folio || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', de fecha '
                            }),
                            new TextRun({
                                text: fechaInfraccion,
                                bold: true
                            }),
                            new TextRun({
                                text: ', emitida por C. Policía Vial '
                            }),
                            new TextRun({
                                text: datosMulta.nombreOficial || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: ', adscrito a la '
                            }),
                            new TextRun({
                                text: `${datosMulta.delegacion || 'No especificado'} ${datosMulta.sector || ''} ${datosMulta.turno || ''}`,
                                bold: true
                            }),
                            new TextRun({
                                text: ', de la Dirección de Policía Vial de León, Guanajuato; con número de empleado '
                            }),
                            new TextRun({
                                text: datosMulta.idOficial || 'No especificado',
                                bold: true
                            }),
                            new TextRun({
                                text: '.'
                            })
                        ],
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // PETITORIO
                    new Paragraph({
                        text: 'Por lo anteriormente expuesto y fundado, a Usted C. Juez Administrativo del Municipio de León, Guanajuato, atentamente, solicito:',
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    new Paragraph({
                        text: 'PRIMERO: Se me tenga por presentado en tiempo y forma el presente medio de impugnación en los términos planteados en el cuerpo del mismo.',
                        spacing: { after: 200 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    new Paragraph({
                        text: 'SEGUNDO: Se conceda la suspensión en los términos solicitados.',
                        spacing: { after: 200 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    new Paragraph({
                        text: 'TERCERO: Seguidos los trámites correspondientes, se declare la nulidad de los actos impugnados.',
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // PROTESTO
                    new Paragraph({
                        text: 'PROTESTO LO NECESARIO',
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: 'En León, Guanajuato, a la fecha de su presentación.',
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 600 }
                    }),

                    // Firma
                    new Paragraph({
                        text: '__________________________________________',
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 }
                    }),
                    new Paragraph({
                        text: `C. ${nombreInfractor.toUpperCase()}`,
                        alignment: AlignmentType.CENTER,
                        bold: true
                    })
                ]
            }]
        });

        // Guardar documento
        const fileName = `DEMANDA_${datosMulta.folio || 'SIN_FOLIO'}_${Date.now()}.docx`;
        const filePath = path.join(this.outputDir, fileName);

        const buffer = await require('docx').Packer.toBuffer(doc);
        await fs.writeFile(filePath, buffer);

        console.log(`📄 Documento generado: ${fileName}`);
        return filePath;
    }
}

module.exports = LegalDocumentGenerator;
