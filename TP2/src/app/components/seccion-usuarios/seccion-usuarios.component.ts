import { Component } from '@angular/core';
import { HabilitarEspecialistasComponent } from '../habilitar-especialistas/habilitar-especialistas.component';
import { RegistroAdminsComponent } from '../registro-admins/registro-admins.component';
import { RegistroEspecialistasComponent } from '../registro-especialistas/registro-especialistas.component';
import { RegistroPacientesComponent } from '../registro-pacientes/registro-pacientes.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [HabilitarEspecialistasComponent, RegistroAdminsComponent, RegistroEspecialistasComponent, RegistroPacientesComponent, NgIf],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.css'
})
export class SeccionUsuariosComponent {

  registroSeleccionado: 'admin' | 'paciente' | 'especialista' = 'admin'; // Valor por defecto

  showRegistro(tipo: 'admin' | 'paciente' | 'especialista') {
    this.registroSeleccionado = tipo;
  }
}
