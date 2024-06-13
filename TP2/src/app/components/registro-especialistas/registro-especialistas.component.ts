import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EspecialidadesComponent } from "../especialidades/especialidades.component";

@Component({
    selector: 'app-registro-especialistas',
    standalone: true,
    templateUrl: './registro-especialistas.component.html',
    styleUrl: './registro-especialistas.component.css',
    imports: [FormsModule, NgIf, EspecialidadesComponent]
})
export class RegistroEspecialistasComponent {
  form: any;

  constructor() { }

  onSubmit(form: any) {
    if (form.valid) {
      const {
        nombre,
        apellido,
        edad,
        dni,
        especialidad,
        otraEspecialidad,
        mail,
        password,
        profileImage
      } = form.value;

      // Aquí puedes manejar el envío del formulario, como guardar en una base de datos o enviar a un servicio

      console.log('Formulario enviado:', {
        nombre,
        apellido,
        edad,
        dni,
        especialidad,
        otraEspecialidad,
        mail,
        password,
        profileImage
      });

      // Puedes hacer un reset del formulario después de enviarlo
      form.reset();
    } else {
      console.error('Formulario inválido. Por favor completa todos los campos correctamente.');
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Puedes procesar el archivo aquí si es necesario
    }
  }

  public recibirEspecialidad(especialidad : string)
  {
    this.form.controls['especialidad'].setValue(especialidad);
  }

}
