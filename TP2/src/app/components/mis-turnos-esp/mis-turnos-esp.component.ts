import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-mis-turnos-esp',
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './mis-turnos-esp.component.html',
  styleUrls: ['./mis-turnos-esp.component.css']
})
export class MisTurnosEspComponent implements OnInit {

  isEspecialista: boolean = false;
  turnos: any[] = [];
  filteredTurnos: any[] = [];
  filterText: string = ''; // Texto del filtro
  showCancelModal: boolean = false;
  showRejectModal: boolean = false;
  showFinishModal: boolean = false;
  showVerEncuestaModal: boolean = false;
  showVerCalificacionModal: boolean = false;
  showHistoriaClinicaModal: boolean = false;
  turnoToModify: any = null; // Turno a modificar
  historiaClinicaForm: FormGroup; // Formulario para la historia clínica

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {
    // Inicialización del formulario de historia clínica
    this.historiaClinicaForm = this.formBuilder.group({
      altura: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      peso: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      temperatura: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      presion: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      datosDinamicos: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.authService.role$.subscribe(async role => {
      this.isEspecialista = role.esEspecialista;
      if (this.isEspecialista) {
        await this.loadTurnos();
      }
    });
  }

  get datosDinamicos() {
    return this.historiaClinicaForm.get('datosDinamicos') as FormArray;
  }

  agregarDatoDinamico() {
    if (this.datosDinamicos.length < 3) {
      this.datosDinamicos.push(this.formBuilder.group({
        clave: ['', Validators.required],
        valor: ['', Validators.required]
      }));
    }
  }

  eliminarDatoDinamico(index: number) {
    this.datosDinamicos.removeAt(index);
  }

  async loadTurnos(): Promise<void> {
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (currentUser) {
        const turnos = await this.authService.getTurnosByEspecialista(currentUser.uid);
        for (const turno of turnos) {
          const pacienteData = await this.authService.getPacienteData(turno.pacienteId);
          turno.pacienteNombre = pacienteData ? `${pacienteData.nombre} ${pacienteData.apellido}` : 'Desconocido';
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

  openRejectModal(turno: any): void {
    this.turnoToModify = turno;
    this.showRejectModal = true;
  }

  openFinishModal(turno: any): void {
    this.turnoToModify = turno;
    this.showFinishModal = true;
  }

  openVerEncuestaModal(turno: any): void {
    this.turnoToModify = turno;
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
    this.showRejectModal = false;
    this.showFinishModal = false;
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

  async confirmRejectTurno(): Promise<void> {
    if (this.turnoToModify && this.turnoToModify.comentarioRechazo && this.turnoToModify.comentarioRechazo.trim() !== '') {
      try {
        await this.authService.rechazarTurno(this.turnoToModify.id, this.turnoToModify.comentarioRechazo);
        this.turnoToModify.estado = 'rechazado'; // Asegúrate de que el estado sea correcto
        this.turnoToModify.comentarioRechazo = ''; // Clear the comment
        await this.loadTurnos(); // Recargar la lista de turnos
        this.closeModal(); // Cierra el modal
      } catch (error) {
        console.error('Error al rechazar el turno:', error);
      }
    } else {
      console.error('Debe proporcionar un comentario para rechazar el turno');
    }
  }

  async confirmFinishTurno(): Promise<void> {
    if (this.turnoToModify && this.turnoToModify.comentarioFinalizacion && this.turnoToModify.comentarioFinalizacion.trim() !== '') {
      try {
        await this.authService.finalizarTurno(this.turnoToModify.id, this.turnoToModify.comentarioFinalizacion);
        this.turnoToModify.estado = 'realizado'; // Asegúrate de que el estado sea correcto
        this.turnoToModify.comentarioFinalizacion = ''; // Clear the comment
        await this.loadTurnos(); // Recargar la lista de turnos
        this.closeModal(); // Cierra el modal
      } catch (error) {
        console.error('Error al finalizar el turno:', error);
      }
    } else {
      console.error('Debe proporcionar un comentario para finalizar el turno');
    }
  }

  async aceptarTurno(turno: any): Promise<void> {
    try {
      await this.authService.aceptarTurno(turno.id);
      turno.estado = 'aceptado'; // Asegúrate de que el estado sea correcto
      await this.loadTurnos(); // Recargar la lista de turnos
    } catch (error) {
      console.error('Error al aceptar el turno:', error);
    }
  }

  async confirmHistoriaClinica(): Promise<void> {
    if (this.historiaClinicaForm.valid && this.turnoToModify) {
      try {
        const historiaClinica = this.historiaClinicaForm.value;
        await this.authService.cargarHistoriaClinica(this.turnoToModify.id, historiaClinica);
        this.turnoToModify.historiaClinica = historiaClinica; // Asignar la historia clínica cargada
        this.turnoToModify.historiaClinicaCargada = true; // Marcar la historia clínica como cargada
        this.filteredTurnos = this.turnos.map(turno => turno.id === this.turnoToModify.id ? this.turnoToModify : turno);
        this.closeModal(); // Cierra el modal
      } catch (error) {
        console.error('Error al cargar la historia clínica:', error);
      }
    } else {
      console.error('Debe completar todos los campos de la historia clínica');
    }
  }

  formatDate(date: Date, formatStr: string): string {
    return format(date, formatStr, { locale: es });
  }
}
