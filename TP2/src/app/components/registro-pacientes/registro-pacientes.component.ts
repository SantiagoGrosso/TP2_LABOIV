import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Paciente } from '../../classes/paciente';
import { NgClass, NgIf } from '@angular/common';
import { CustomValidators } from '../../validators/custom-validators';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-registro-pacientes',
  standalone: true,
  templateUrl: './registro-pacientes.component.html',
  styleUrls: ['./registro-pacientes.component.css'],
  imports: [FormsModule, NgClass, NgIf, ReactiveFormsModule]
})
export class RegistroPacientesComponent {

  profileImages: File[] = [];
  vieneDeRegistro: boolean = false;

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
      nombre: ['', [Validators.required, CustomValidators.noNumbers, CustomValidators.minLength(3)]],
      apellido: ['', [Validators.required, CustomValidators.noNumbers, CustomValidators.minLength(3)]],
      dni: ['', [Validators.required, Validators.pattern("[0-9]{8}")]],
      edad: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      obraSocial: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      foto1: ['', Validators.required],
      foto2: ['', Validators.required],
    });
  }

  // Método para registrar el paciente
  async onSubmit() {
    if (this.registerForm && this.registerForm.valid) {
      const paciente = this.registerForm.value;
      const password = this.registerForm.value.password;

      try {
        const pacienteId = await this.auth.guardarPaciente(paciente, password);
        console.log('Paciente registrado con ID: ', pacienteId);
        this.router.navigate(['/exito']);
      } catch (error) {
        console.error('Error al registrar el paciente: ', error);
        // Manejar error, mostrar mensaje al usuario, etc.
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
  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      // Asignar archivo al control correspondiente según el índice
      this.registerForm.patchValue({ [`foto${index}`]: file });
    }
  }
}
