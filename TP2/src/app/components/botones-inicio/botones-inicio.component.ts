import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-botones-inicio',
  standalone: true,
  imports: [],
  templateUrl: './botones-inicio.component.html',
  styleUrl: './botones-inicio.component.css'
})
export class BotonesInicioComponent {
  @Output() credencialesSeleccionadas = new EventEmitter<any>();

  // Método para manejar el clic en un botón y emitir las credenciales
  seleccionarCredenciales(email: string, password: string) {
    const credenciales = {
      email : email,
      password : password
    };
    this.credencialesSeleccionadas.emit(credenciales);
  }

}
