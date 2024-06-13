import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, NgModule, Output } from '@angular/core';
import { FormsModule, NgModel, NgModelGroup } from '@angular/forms';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [NgIf, NgClass, FormsModule, NgFor],
  templateUrl: './especialidades.component.html',
  styleUrl: './especialidades.component.css'
})
export class EspecialidadesComponent {

  public especialidad : string = "Dermatólogo";
  public nuevaEspecialidad : string = "";
  public especialidades: string[] = ["Dermatólogo", "Kinesiólogo", "Cardiólogo", "Neurólogo"];
  public agregandoEspecialidad: boolean = false;
  @Output() especilidadSeleccionada = new EventEmitter<string>();

  constructor() {}

  mostrarInput() 
  {
    this.agregandoEspecialidad = true;
  }

  agregarEspecialidad() {
    if (this.nuevaEspecialidad.trim() != '' && this.especialidades.indexOf(this.nuevaEspecialidad) == -1) 
    {
      this.especialidades.push(this.nuevaEspecialidad);
      this.especialidad = this.nuevaEspecialidad;
      this.nuevaEspecialidad = '';
      this.agregandoEspecialidad = false; 
    }
  }

  cancelarAgregado() 
  {
    this.agregandoEspecialidad = false; 
    this.nuevaEspecialidad = ''; 
  }

  public enviarEspecialidad() {
    this.especilidadSeleccionada.emit(this.especialidad);
  }

}
