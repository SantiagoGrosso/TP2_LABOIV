import { formatDate, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface Paciente {
  id: string;
  nombre: string;
  foto1: string;
  consultas: Consulta[];
}

interface Consulta {
  fecha: string;
  especialidad: string;
  comentario: string;
}

@Component({
  selector: 'app-seccion-pacientes',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './seccion-pacientes.component.html',
  styleUrls: ['./seccion-pacientes.component.css']
})
export class SeccionPacientesComponent implements OnInit {
  pacientes: Paciente[] = [];
  historiaClinica: any = null;
  mostrarHistoriaClinica: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarPacientesAtendidos();
  }

  private async cargarPacientesAtendidos(): Promise<void> {
    try {
      this.authService.getCurrentUserData().subscribe(async (userData) => {
        if (userData?.role === 'especialista' && userData.data?.uid) {
          const especialistaId = userData.data.uid;
          const pacientes = await this.authService.getPacientesAtendidosPorEspecialista(especialistaId);
          this.pacientes = pacientes.map(paciente => ({
            ...paciente,
            consultas: paciente.consultas
              .sort((a: Consulta, b: Consulta) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map((consulta: Consulta) => ({
                ...consulta,
                fecha: formatDate(consulta.fecha, 'dd/MM/yyyy', 'en-US') // Formato de fecha
              }))
              .slice(0, 3) // Mostrar las últimas 3 consultas
          }));
        }
      });
    } catch (error) {
      console.error('Error al cargar pacientes atendidos:', error);
    }
  }

  async verHistoriaClinica(paciente: Paciente): Promise<void> {
    try {
      const historiaClinica = await this.authService.getHistoriasClinicasByPaciente(paciente.id);
      if (historiaClinica) {
        this.historiaClinica = historiaClinica;
        this.mostrarHistoriaClinica = true;
      } else {
        console.error('No se encontró la historia clínica para el paciente:', paciente.id);
      }
    } catch (error) {
      console.error('Error al obtener la historia clínica:', error);
    }
  }
}
