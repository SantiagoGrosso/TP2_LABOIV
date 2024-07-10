import { Component, OnInit } from '@angular/core';
import { HabilitarEspecialistasComponent } from '../habilitar-especialistas/habilitar-especialistas.component';
import { RegistroAdminsComponent } from '../registro-admins/registro-admins.component';
import { RegistroEspecialistasComponent } from '../registro-especialistas/registro-especialistas.component';
import { RegistroPacientesComponent } from '../registro-pacientes/registro-pacientes.component';
import { NgFor, NgIf } from '@angular/common';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

interface Paciente {
  id: string;
  nombre: string;
  foto1: string;
  // Otros datos del paciente...
}

interface Turno {
  turno: any;
  especialista: string;
  especialidad: string;
  historiaClinica: any;
  estado: string;
}

interface DataExport {
  fecha: string;
  hora: string;
  especialista: string;
  especialidad: string;
  [key: string]: any;  // Para datos dinámicos
}

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [HabilitarEspecialistasComponent, RegistroAdminsComponent, RegistroEspecialistasComponent, RegistroPacientesComponent, NgIf, NgFor],
  templateUrl: './seccion-usuarios.component.html',
  styleUrls: ['./seccion-usuarios.component.css']
})
export class SeccionUsuariosComponent implements OnInit {

  registroSeleccionado: 'admin' | 'paciente' | 'especialista' = 'admin'; // Valor por defecto
  pacientes: Paciente[] = [];
  pacienteSeleccionado: Paciente | null = null;
  historiasClinicas: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  showRegistro(tipo: 'admin' | 'paciente' | 'especialista') {
    this.registroSeleccionado = tipo;
  }

  private async cargarPacientes(): Promise<void> {
    try {
      this.pacientes = await this.authService.getAllPacientes();
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  }

  async handlePacienteClick(paciente: Paciente): Promise<void> {
    this.pacienteSeleccionado = paciente;
    this.cargarHistoriasClinicas(paciente.id);
    this.descargarTurnos(paciente);
  }

  private async cargarHistoriasClinicas(pacienteId: string): Promise<void> {
    try {
      this.historiasClinicas = await this.authService.getHistoriasClinicasByPaciente(pacienteId);
    } catch (error) {
      console.error('Error al cargar historias clínicas:', error);
    }
  }

  async descargarTurnos(paciente: Paciente): Promise<void> {
    try {
      const turnos: Turno[] = await this.authService.getTurnosByPaciente(paciente.id);
      const especialistasMap = await this.authService.getAllEspecialistasMap();

      // Filtrar los turnos realizados
      const turnosRealizados = turnos.filter(turno => turno.estado === 'realizado');

      if (turnosRealizados.length > 0) {
        const turnosProcesados = await Promise.all(turnosRealizados.map(async turno => {
          const nombreEspecialista = especialistasMap.get(turno.especialista) || 'No disponible';
          const datosDinamicos = turno.historiaClinica?.datosDinamicos || [];
          const data: DataExport = {
            fecha: turno.turno.toDate().toLocaleDateString(),
            hora: turno.turno.toDate().toLocaleTimeString('en-GB'), // Cambio aquí para formato de 24 horas
            especialista: nombreEspecialista,
            especialidad: turno.especialidad,
            altura: turno.historiaClinica?.altura || 'X',
            peso: turno.historiaClinica?.peso || 'X',
            temperatura: turno.historiaClinica?.temperatura || 'X',
            presion: turno.historiaClinica?.presion || 'X'
          };

          datosDinamicos.forEach((dato: any) => {
            data[dato.clave] = dato.valor || 'X';
          });

          return data;
        }));

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(turnosProcesados);
        const workbook: XLSX.WorkBook = { Sheets: { 'Turnos': worksheet }, SheetNames: ['Turnos'] };
        const fileName = `turnos_${paciente.nombre}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      } else {
        Swal.fire('No hay turnos realizados para el paciente seleccionado.');
      }
    } catch (error: any) {
      console.error('Error al descargar los turnos:', error);
      Swal.fire('Error al descargar los turnos.');
    }
  }
}
