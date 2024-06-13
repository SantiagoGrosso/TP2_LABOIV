import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-registro-pacientes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registro-pacientes.component.html',
  styleUrl: './registro-pacientes.component.css'
})
export class RegistroPacientesComponent {

  profileImages: File[] = [];

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.profileImages[index - 1] = file;
    }
  }

  onSubmit() {
    // Lógica para enviar el formulario
    // Puedes manejar el envío del formulario aquí y acceder a los archivos en this.profileImages
    console.log('Formulario enviado');
  }

}
