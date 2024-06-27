import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-habilitar-especialistas',
  standalone: true,
  imports: [NgFor],
  templateUrl: './habilitar-especialistas.component.html',
  styleUrl: './habilitar-especialistas.component.css'
})

export class HabilitarEspecialistasComponent implements OnInit {
  especialistas: any[] = []; // Define un arreglo para almacenar los datos de los especialistas
  pacientes: any[] = []; 
  administradores: any[] = [];

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.loadEspecialistas(); // Llama a la función para cargar los especialistas al iniciar el componente
    this.loadPacientes();
    this.loadAdministradores();
  }

  async loadEspecialistas() {
    try {
      this.especialistas = await this.auth.getAllEspecialistas();
    } catch (error) {
      console.error('Error al obtener los especialistas:', error);
      // Puedes agregar aquí la lógica para manejar errores si es necesario
    }
  }

  async loadPacientes() {
    try {
      this.pacientes = await this.auth.getAllPacientes();
    } catch (error) {
      console.error('Error al obtener los pacientes:', error);
      // Puedes agregar aquí la lógica para manejar errores si es necesario
    }
  }

  async loadAdministradores() {
    try {
      this.administradores = await this.auth.getAllAdmin();
    } catch (error) {
      console.error('Error al obtener los administradores:', error);
      // Puedes agregar aquí la lógica para manejar errores si es necesario
    }
  }

  async toggleHabilitado(especialistaId: string, actualHabilitado: boolean) {
    const newHabilitado = !actualHabilitado; // Invierte el estado actual
    try {
      await this.auth.toggleHabilitadoEspecialista(especialistaId, newHabilitado);
      // Actualiza localmente el estado del especialista si la operación en Firestore tiene éxito
      const especialistaIndex = this.especialistas.findIndex(e => e.id === especialistaId);
      if (especialistaIndex !== -1) {
        this.especialistas[especialistaIndex].habilitado = newHabilitado;
      }
    } catch (error) {
      console.error('Error al cambiar la habilitación del especialista:', error);
      // Puedes agregar aquí la lógica para manejar errores si es necesario
    }
  }
}
