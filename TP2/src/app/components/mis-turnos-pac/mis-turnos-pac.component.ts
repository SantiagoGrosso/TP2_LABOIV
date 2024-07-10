import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-mis-turnos-pac',
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule],
  templateUrl: './mis-turnos-pac.component.html',
  styleUrls: ['./mis-turnos-pac.component.css']
})
export class MisTurnosPacComponent implements OnInit {

  isPaciente: boolean = false;
  turnos: any[] = [];
  filteredTurnos: any[] = [];
  filterText: string = ''; // Texto del filtro
  showCancelModal: boolean = false;
  showEncuestaModal: boolean = false;
  showCalificarModal: boolean = false;
  showVerEncuestaModal: boolean = false;
  showVerCalificacionModal: boolean = false;
  showHistoriaClinicaModal: boolean = false;
  turnoToModify: any = null; // Turno a modificar

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.role$.subscribe(async role => {
      this.isPaciente = role.esPaciente;
      if (this.isPaciente) {
        await this.loadTurnos();
      }
    });
  }

  async loadTurnos(): Promise<void> {
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (currentUser) {
        const turnos = await this.authService.getTurnosByPaciente(currentUser.uid);
        for (const turno of turnos) {
          const especialistaData = await this.authService.getEspecialistaData(turno.especialista);
          turno.especialistaNombre = especialistaData ? `${especialistaData.nombre} ${especialistaData.apellido}` : 'Desconocido';
          turno.turnoDate = turno.turno.toDate(); // Convertir a Date para el formateo
          // Inicializa la encuesta si no está definida
          if (!turno.encuestaComentario) {
            turno.encuestaComentario = {
              puntualidad: '',
              diagnostico: '',
              limpieza: '',
              comodidad: '',
              satisfaccion: ''
            };
          }
          // Inicializa la historia clínica si no está definida
          if (!turno.historiaClinica) {
            turno.historiaClinica = {};
          }
          turno.historiaClinicaCargada = !!turno.historiaClinica.altura;
        }
        this.turnos = turnos;
        this.filteredTurnos = turnos;
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  }

  filterTurnos(): void {
    const filterValue = this.filterText.toLowerCase();
    this.filteredTurnos = this.turnos.filter(turno => 
      Object.values(turno).some(val => {
        if (val instanceof Date) {
          const formattedDate = this.formatDate(val, 'EEEE, d MMMM yyyy');
          const formattedTime = this.formatDate(val, 'HH:mm');
          return formattedDate.toLowerCase().includes(filterValue) || formattedTime.toLowerCase().includes(filterValue);
        }
        if (typeof val === 'string' || typeof val === 'number') {
          return val.toString().toLowerCase().includes(filterValue);
        }
        if (typeof val === 'object' && val !== null) {
          // Check if the object is a historiaClinica
          if ('altura' in val || 'peso' in val || 'temperatura' in val || 'presion' in val) {
            const historiaClinica = val as any; // Replace 'any' with the appropriate interface if available
            return (
              historiaClinica.altura?.toString().toLowerCase().includes(filterValue) ||
              historiaClinica.peso?.toString().toLowerCase().includes(filterValue) ||
              historiaClinica.temperatura?.toString().toLowerCase().includes(filterValue) ||
              historiaClinica.presion?.toString().toLowerCase().includes(filterValue) ||
              (historiaClinica.datosDinamicos && historiaClinica.datosDinamicos.some((dato: any) =>
                dato.clave.toLowerCase().includes(filterValue) ||
                dato.valor.toLowerCase().includes(filterValue)
              ))
            );
          } else {
            // Filtrar otros objetos en el turno
            return Object.values(val).some(nestedVal => {
              if (typeof nestedVal === 'string' || typeof nestedVal === 'number') {
                return nestedVal.toString().toLowerCase().includes(filterValue);
              }
              return false;
            });
          }
        }
        return false;
      })
    );
  }

  openCancelModal(turno: any): void {
    this.turnoToModify = turno;
    this.showCancelModal = true;
  }

  openEncuestaModal(turno: any): void {
    this.turnoToModify = turno;
    if (!this.turnoToModify.encuestaComentario) {
      this.turnoToModify.encuestaComentario = {
        puntualidad: '',
        diagnostico: '',
        limpieza: '',
        comodidad: '',
        satisfaccion: ''
      };
    }
    this.showEncuestaModal = true;
  }

  openCalificarModal(turno: any): void {
    this.turnoToModify = turno;
    this.turnoToModify.calificacionAtencion = null; // Initialize calificacion object
    this.showCalificarModal = true;
  }

  openVerEncuestaModal(turno: any): void {
    this.turnoToModify = turno;
    if (!this.turnoToModify.encuestaComentario) {
      this.turnoToModify.encuestaComentario = {
        puntualidad: '',
        diagnostico: '',
        limpieza: '',
        comodidad: '',
        satisfaccion: ''
      };
    }
    this.showVerEncuestaModal = true;
  }

  openVerCalificacionModal(turno: any): void {
    this.turnoToModify = turno;
    this.showVerCalificacionModal = true;
  }

  openHistoriaClinicaModal(turno: any): void {
    this.turnoToModify = turno;
    this.showHistoriaClinicaModal = true;
  }

  closeModal(): void {
    this.showCancelModal = false;
    this.showEncuestaModal = false;
    this.showCalificarModal = false;
    this.showVerEncuestaModal = false;
    this.showVerCalificacionModal = false;
    this.showHistoriaClinicaModal = false;
    this.turnoToModify = null;
  }

  async confirmCancelTurno(): Promise<void> {
    if (this.turnoToModify && this.turnoToModify.comentarioCancelacion && this.turnoToModify.comentarioCancelacion.trim() !== '') {
      try {
        await this.authService.cancelarTurno(this.turnoToModify.id, this.turnoToModify.comentarioCancelacion);
        this.turnoToModify.estado = 'cancelado'; // Asegúrate de que el estado sea correcto
        this.turnoToModify.comentarioCancelacion = ''; // Clear the comment
        await this.loadTurnos(); // Recargar la lista de turnos
        this.closeModal(); // Cierra el modal
      } catch (error) {
        console.error('Error al cancelar el turno:', error);
      }
    } else {
      console.error('Debe proporcionar un comentario para cancelar el turno');
    }
  }

  async confirmarEncuesta(): Promise<void> {
    if (this.turnoToModify.encuestaComentario.puntualidad && this.turnoToModify.encuestaComentario.diagnostico && 
        this.turnoToModify.encuestaComentario.limpieza && this.turnoToModify.encuestaComentario.comodidad && 
        this.turnoToModify.encuestaComentario.satisfaccion) {
      try {
        await this.authService.completarEncuesta(this.turnoToModify.id, this.turnoToModify.encuestaComentario);
        this.turnoToModify.encuestaCompleta = true;
        await this.loadTurnos(); // Recargar la lista de turnos
        this.closeModal(); // Cierra el modal
      } catch (error) {
        console.error('Error al enviar la encuesta:', error);
      }
    } else {
      console.error('Debe completar todos los campos de la encuesta');
    }
  }

  async confirmarCalificacion(): Promise<void> {
    if (this.turnoToModify.calificacionAtencion) {
      try {
        await this.authService.calificarAtencion(this.turnoToModify.id, this.turnoToModify.calificacionAtencion);
        this.turnoToModify.calificacionAtencionCompleta = true;
        await this.loadTurnos(); // Recargar la lista de turnos
        this.closeModal(); // Cierra el modal
      } catch (error) {
        console.error('Error al enviar la calificación:', error);
      }
    } else {
      console.error('Debe seleccionar una calificación');
    }
  }

  formatDate(date: Date, formatStr: string): string {
    return format(date, formatStr, { locale: es });
  }
}
