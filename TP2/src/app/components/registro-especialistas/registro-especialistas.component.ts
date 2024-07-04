import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Especialista } from '../../classes/especialista';
import { NgClass, NgIf } from '@angular/common';
import { CustomValidators } from '../../validators/custom-validators';
import { DataService } from '../../services/data.service';
import Swal from 'sweetalert2';
import { EspecialidadesComponent } from "../especialidades/especialidades.component";

@Component({
  selector: 'app-registro-especialistas',
  standalone: true,
  templateUrl: './registro-especialistas.component.html',
  styleUrls: ['./registro-especialistas.component.css'],
  imports: [FormsModule, NgClass, NgIf, ReactiveFormsModule, EspecialidadesComponent]
})
export class RegistroEspecialistasComponent {

  profileImage: File | null = null;

  // Definición del FormGroup
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private data: DataService
  ) {
    // Inicialización del FormGroup y definición de los controles
    this.registerForm = this.formBuilder.group({
      nombre: ['', [Validators.required, CustomValidators.onlyLetters, CustomValidators.minLength(3)]],
      apellido: ['', [Validators.required, CustomValidators.onlyLetters, CustomValidators.minLength(3)]],
      dni: ['', [Validators.required, CustomValidators.onlyNumbers, CustomValidators.maxLength(8), CustomValidators.minLength(8)]],
      edad: ['', [Validators.required, CustomValidators.onlyNumbers, CustomValidators.maxLength(1), CustomValidators.minLength(2)]],
      especialidad: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      foto1: ['', Validators.required],
    });
  }

  // Método para registrar el especialista
  async onSubmit() {
    if (this.registerForm && this.registerForm.valid) {
      const especialista = this.registerForm.value;
      const password = this.registerForm.value.password;
      const horarios: string[] = []; // Define y obtén los horarios seleccionados desde tu interfaz

      try {
        const especialistaId = await this.auth.guardarEspecialista(especialista, password, horarios); // Envía los horarios seleccionados al servicio
        console.log('Especialista registrado con ID: ', especialistaId);
        Swal.fire({
          position: "top-right",
          icon: "success",
          title: "Te has registrado correctamente",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        console.error('Error al registrar el especialista:', error);
        Swal.fire({
          position: "top-left",
          icon: "error",
          title: "Error al registrarte",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } else {
      // Marcar controles como tocados para mostrar errores de validación
      this.markFormGroupTouched(this.registerForm);
    }
  }
  

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Método para manejar cambio de archivos de imagen
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Asignar archivo al control correspondiente
      this.registerForm.patchValue({ foto1: file });
    }
  }

  public recibirEspecialidad(especialidad: string) {
    this.registerForm.controls['especialidad'].setValue(especialidad);
  }
}
