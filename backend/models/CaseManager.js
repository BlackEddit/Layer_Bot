/**
 * ⚖️ CASE MANAGER - Gestor de Casos Legales
 * Maneja consultas, casos activos y cerrados
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CaseManager {
    constructor() {
        this.casesFile = path.join(__dirname, '../../storage/data/cases.json');
        this.cases = this.loadCases();
        
        console.log('⚖️ CaseManager inicializado');
    }

    loadCases() {
        try {
            if (fs.existsSync(this.casesFile)) {
                const data = fs.readFileSync(this.casesFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('❌ Error cargando casos:', error);
        }

        // Estructura inicial
        return {
            consultations: [],  // Consultas pendientes/agendadas
            active: [],         // Casos en proceso
            closed: [],         // Casos cerrados
            stats: {
                totalConsultations: 0,
                totalCases: 0,
                revenue: 0
            }
        };
    }

    saveCases() {
        try {
            const dir = path.dirname(this.casesFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.casesFile, JSON.stringify(this.cases, null, 2));
        } catch (error) {
            console.error('❌ Error guardando casos:', error);
        }
    }

    // ========================
    // CONSULTAS
    // ========================

    createConsultation(clientPhone, clientName, issue, urgency = 'normal') {
        const consultation = {
            id: `CONS-${uuidv4().slice(0, 8).toUpperCase()}`,
            clientPhone: clientPhone,
            clientName: clientName,
            issue: issue,
            urgency: urgency, // 'normal' o 'urgent'
            status: 'pending', // 'pending', 'scheduled', 'completed', 'cancelled'
            createdAt: new Date().toISOString(),
            scheduledFor: null,
            notes: []
        };

        this.cases.consultations.push(consultation);
        this.cases.stats.totalConsultations++;
        this.saveCases();

        console.log(`✅ Consulta creada: ${consultation.id}`);
        return consultation;
    }

    scheduleConsultation(consultationId, dateTime, notes = '') {
        const consultation = this.cases.consultations.find(c => c.id === consultationId);
        
        if (!consultation) {
            console.error(`❌ Consulta ${consultationId} no encontrada`);
            return false;
        }

        consultation.scheduledFor = dateTime;
        consultation.status = 'scheduled';
        if (notes) {
            consultation.notes.push({
                date: new Date().toISOString(),
                note: notes
            });
        }

        this.saveCases();
        console.log(`📅 Consulta agendada: ${consultationId} para ${dateTime}`);
        return true;
    }

    completeConsultation(consultationId, outcome, convertToCase = false) {
        const consultation = this.cases.consultations.find(c => c.id === consultationId);
        
        if (!consultation) return false;

        consultation.status = 'completed';
        consultation.completedAt = new Date().toISOString();
        consultation.outcome = outcome;

        this.saveCases();
        return consultation;
    }

    // ========================
    // CASOS LEGALES
    // ========================

    createCase(consultationId, caseType, description, estimatedCost, clientInfo) {
        const legalCase = {
            id: `CASO-${uuidv4().slice(0, 8).toUpperCase()}`,
            consultationId: consultationId,
            caseType: caseType, // 'divorcio', 'civil', 'laboral', 'penal', 'testamento'
            description: description,
            estimatedCost: estimatedCost,
            paidAmount: 0,
            status: 'active', // 'active', 'in-progress', 'suspended', 'closed'
            priority: 'normal', // 'low', 'normal', 'high', 'urgent'
            createdAt: new Date().toISOString(),
            client: clientInfo,
            updates: [],
            documents: [],
            hearings: [] // Audiencias
        };

        this.cases.active.push(legalCase);
        this.cases.stats.totalCases++;
        this.saveCases();

        console.log(`⚖️ Caso creado: ${legalCase.id}`);
        return legalCase;
    }

    addCaseUpdate(caseId, updateText, updatedBy = 'Sistema') {
        const legalCase = this.findCase(caseId);
        
        if (!legalCase) {
            console.error(`❌ Caso ${caseId} no encontrado`);
            return false;
        }

        legalCase.updates.push({
            date: new Date().toISOString(),
            update: updateText,
            by: updatedBy
        });

        this.saveCases();
        return true;
    }

    addHearing(caseId, hearingDate, type, location, notes = '') {
        const legalCase = this.findCase(caseId);
        
        if (!legalCase) return false;

        const hearing = {
            id: uuidv4().slice(0, 8),
            date: hearingDate,
            type: type, // 'audiencia', 'junta', 'diligencia'
            location: location,
            notes: notes,
            status: 'scheduled', // 'scheduled', 'completed', 'postponed', 'cancelled'
            result: null
        };

        legalCase.hearings.push(hearing);
        this.saveCases();

        return hearing;
    }

    closeCase(caseId, resolution, finalCost) {
        const caseIndex = this.cases.active.findIndex(c => c.id === caseId);
        
        if (caseIndex === -1) {
            console.error(`❌ Caso ${caseId} no encontrado`);
            return false;
        }

        const closedCase = this.cases.active[caseIndex];
        closedCase.status = 'closed';
        closedCase.resolution = resolution;
        closedCase.finalCost = finalCost;
        closedCase.closedAt = new Date().toISOString();

        // Actualizar estadísticas
        this.cases.stats.revenue += finalCost;

        // Mover a cerrados
        this.cases.closed.push(closedCase);
        this.cases.active.splice(caseIndex, 1);

        this.saveCases();
        console.log(`✅ Caso cerrado: ${caseId}`);
        return true;
    }

    // ========================
    // BÚSQUEDA Y CONSULTAS
    // ========================

    findCase(caseId) {
        return this.cases.active.find(c => c.id === caseId) ||
               this.cases.closed.find(c => c.id === caseId);
    }

    getClientCases(clientPhone) {
        // Buscar todas las consultas del cliente
        const consultations = this.cases.consultations.filter(
            c => c.clientPhone === clientPhone
        );

        // Buscar casos activos del cliente
        const activeCases = this.cases.active.filter(c => 
            c.client && c.client.phone === clientPhone
        );

        // Buscar casos cerrados del cliente
        const closedCases = this.cases.closed.filter(c =>
            c.client && c.client.phone === clientPhone
        );

        return {
            consultations,
            active: activeCases,
            closed: closedCases,
            totalCases: activeCases.length + closedCases.length
        };
    }

    getPendingConsultations() {
        return this.cases.consultations.filter(c => 
            c.status === 'pending' || c.status === 'scheduled'
        );
    }

    getActiveCases() {
        return this.cases.active;
    }

    getUrgentCases() {
        return [
            ...this.cases.consultations.filter(c => c.urgency === 'urgent'),
            ...this.cases.active.filter(c => c.priority === 'urgent' || c.priority === 'high')
        ];
    }

    getUpcomingHearings(days = 7) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + days);

        const hearings = [];

        this.cases.active.forEach(legalCase => {
            legalCase.hearings.forEach(hearing => {
                const hearingDate = new Date(hearing.date);
                if (hearingDate >= now && hearingDate <= futureDate && hearing.status === 'scheduled') {
                    hearings.push({
                        ...hearing,
                        caseId: legalCase.id,
                        caseType: legalCase.caseType,
                        client: legalCase.client
                    });
                }
            });
        });

        return hearings.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // ========================
    // ESTADÍSTICAS
    // ========================

    getStats() {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        // Consultas este mes
        const consultationsThisMonth = this.cases.consultations.filter(c => {
            const date = new Date(c.createdAt);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        }).length;

        // Casos por tipo
        const casesByType = {};
        this.cases.active.forEach(c => {
            casesByType[c.caseType] = (casesByType[c.caseType] || 0) + 1;
        });

        return {
            total_consultations: this.cases.stats.totalConsultations,
            pending_consultations: this.cases.consultations.filter(c => c.status === 'pending').length,
            scheduled_consultations: this.cases.consultations.filter(c => c.status === 'scheduled').length,
            total_cases: this.cases.stats.totalCases,
            active_cases: this.cases.active.length,
            closed_cases: this.cases.closed.length,
            urgent_items: this.getUrgentCases().length,
            consultations_this_month: consultationsThisMonth,
            cases_by_type: casesByType,
            total_revenue: this.cases.stats.revenue,
            upcoming_hearings: this.getUpcomingHearings().length
        };
    }
}

module.exports = CaseManager;
