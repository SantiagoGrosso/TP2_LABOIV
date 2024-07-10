import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css']
})
export class TurnosComponent implements OnInit {

  isAdmin: boolean = false;
  turnos: any[] = [];
  filteredTurnos: any[] = [];
  filterText: string = ''; // Texto del filtro
  showCancelModal: boolean = false;
  turnoToCancel: any = null; // Turno a cancelar

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.role$.subscribe(role => {
      this.isAdmin = role.esAdmin;
      if (this.isAdmin) {
        this.loadTurnos();
      }
    });
  }

  async loadTurnos(): Promise<void> {
    try {
      const turnos = await this.authService.getAllTurnos();
      for (const turno of turnos) {
        const especialistaData = await this.authService.getEspecialistaData(turno.especialista);
        const pacienteData = await this.authService.getPacienteData(turno.pacienteId);
        turno.especialistaNombre = especialistaData ? `${especialistaData.nombre} ${especialistaData.apellido}` : 'Desconocido';
        turno.pacienteNombre = pacienteData ? `${pacienteData.nombre} ${pacienteData.apellido}` : 'Desconocido';
        turno.turnoDate = turno.turno.toDate(); // Convertir a Date para el formateo
      }
      this.turnos = turnos;
      this.filteredTurnos = turnos;
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
        return false;
      })
    );
  }

  openCancelModal(turno: any): void {
    this.turnoToCancel = turno;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.turnoToCancel = null;
  }

  async confirmCancelTurno(): Promise<void> {
    if (this.turnoToCancel && this.turnoToCancel.comentarioCancelacion && this.turnoToCancel.comentarioCancelacion.trim() !== '') {
      try {
        await this.authService.cancelarTurno(this.turnoToCancel.id, this.turnoToCancel.comentarioCancelacion);
        await this.loadTurnos(); // Recarga la lista de turnos después de cancelar
        this.closeCancelModal(); // Cierra el modal
      } catch (error) {
        console.error('Error al cancelar el turno:', error);
      }
    } else {
      console.error('Debe proporcionar un comentario para cancelar el turno');
    }
  }

  formatDate(date: Date, formatStr: string): string {
    return format(date, formatStr, { locale: es });
  }
}
