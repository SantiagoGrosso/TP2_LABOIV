import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { addDays, addMinutes, format, isSaturday, isSunday, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-solicitar-turnos',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule],
  templateUrl: './solicitar-turnos.component.html',
  styleUrls: ['./solicitar-turnos.component.css']
})
export class SolicitarTurnosComponent implements OnInit {

  specialists: any[] = [];
  selectedSpecialist: any = null;
  selectedSpecialty: string | null = null;
  availableDays: Date[] = [];
  selectedDay: Date | null = null;
  selectedHorario: Date | null = null;
  horariosDisponibles: Date[] = []; // Array de horarios disponibles para mostrar
  errorMessage: string | null = null; // Para mostrar mensajes de error
  isAdmin: boolean = false;
  isPaciente: boolean = false;
  pacientes: any[] = [];
  selectedPaciente: any = null; // Paciente seleccionado por admin

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadSpecialists();
    this.authService.role$.subscribe(role => {
      this.isAdmin = role.esAdmin;
      this.isPaciente = role.esPaciente;
      if (this.isAdmin) {
        this.loadPacientes();
      }
    });
  }

  loadSpecialists() {
    this.authService.getAllEspecialistas().then(specialists => {
      this.specialists = specialists;
    });
  }

  loadPacientes() {
    this.authService.getAllPacientes().then(pacientes => {
      this.pacientes = pacientes;
    });
  }

  selectSpecialist(specialist: any) {
    this.selectedSpecialist = specialist;
    if (typeof this.selectedSpecialist.especialidad === 'string') {
      this.selectedSpecialist.especialidad = [this.selectedSpecialist.especialidad];
    }
  }

  deselectSpecialist() {
    this.selectedSpecialist = null;
    this.selectedSpecialty = null;
    this.availableDays = [];
    this.selectedDay = null;
    this.selectedHorario = null;
    this.horariosDisponibles = [];
    this.errorMessage = null; // Restablecer mensaje de error
  }

  getEspecialidadImage(especialidad: string): string {
    switch (especialidad.toLowerCase()) {
      case 'dermatólogo':
        return 'assets/dermatologo.png';
      case 'kinesiólogo':
        return 'assets/kinesiologo.png';
      case 'cardiólogo':
        return 'assets/cardiologo.png';
      case 'neurólogo':
        return 'assets/neurologo.png';
      default:
        return 'assets/default.png';
    }
  }

  selectSpecialty(specialty: string) {
    this.selectedSpecialty = specialty;
    this.generateAvailableDays();
  }

  generateAvailableDays() {
    const today = new Date();
    this.availableDays = Array.from({ length: 15 }, (_, i) => addDays(today, i)).filter(day => !isSunday(day));
  }

  selectDay(day: Date) {
    this.selectedDay = day;
    this.generateAvailableSlots(day);
  }

  generateAvailableSlots(day: Date) {
    if (!this.selectedSpecialist || !this.selectedSpecialist.horarios) {
      return;
    }

    const slots: Date[] = [];
    if (isSaturday(day)) {
      this.addSlotsForPeriod(day, 8, 14, slots);
    } else {
      if (this.selectedSpecialist.horarios.includes('Mañana')) {
        this.addSlotsForPeriod(day, 8, 12, slots);
      }
      if (this.selectedSpecialist.horarios.includes('Tarde')) {
        this.addSlotsForPeriod(day, 12, 19, slots);
      }
    }

    this.horariosDisponibles = slots;
  }

  addSlotsForPeriod(day: Date, startHour: number, endHour: number, slots: Date[]) {
    const start = startOfDay(day);
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(addMinutes(start, hour * 60 + minute));
      }
    }
  }

  selectHorario(horario: Date) {
    this.selectedHorario = horario;
    console.log('Horario seleccionado:', horario);
  }

  formatDate(date: Date, formatStr: string): string {
    return format(date, formatStr, { locale: es });
  }

  async saveTurno() {
    if (this.selectedSpecialist && this.selectedSpecialty && this.selectedDay && this.selectedHorario) {
      const isTaken = await this.authService.isTurnoTaken(
        this.selectedSpecialist.id,
        this.selectedDay,
        this.selectedHorario
      );

      if (isTaken) {
        this.errorMessage = 'Este turno ya está tomado. Por favor, elige otro horario.';
        return;
      }

      let pacienteId = '';
      if (this.isAdmin) {
        if (!this.selectedPaciente) {
          this.errorMessage = 'Por favor, selecciona un paciente.';
          return;
        }
        pacienteId = this.selectedPaciente.id;
      } else if (this.isPaciente) {
        const currentUser = await this.authService.getCurrentUser();
        pacienteId = currentUser?.uid || '';
      }

      this.authService.saveTurno({
        specialistId: this.selectedSpecialist.id,
        specialty: this.selectedSpecialty,
        date: this.selectedDay,
        time: this.selectedHorario,
        pacienteId: pacienteId
      }).then(() => {
        console.log('Turno guardado con éxito');
        this.errorMessage = null; // Restablecer mensaje de error
        // Puedes agregar lógica adicional después de guardar el turno, como notificaciones
      }).catch(error => {
        console.error('Error al guardar el turno:', error);
        this.errorMessage = 'Ocurrió un error al guardar el turno. Inténtalo de nuevo.';
      });
    }
  }
}
