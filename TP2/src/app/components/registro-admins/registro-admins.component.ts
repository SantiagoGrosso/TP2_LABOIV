import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CustomValidators } from '../../validators/custom-validators';
import Swal from 'sweetalert2';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-registro-admins',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf, ReactiveFormsModule, RecaptchaModule, RecaptchaFormsModule],
  templateUrl: './registro-admins.component.html',
  styleUrls: ['./registro-admins.component.css']
})
export class RegistroAdminsComponent {

  profileImages: File[] = [];
  vieneDeRegistro: boolean = false;
  captchaError: boolean = false;

  // Definición del FormGroup
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
  ) {
    // Inicialización del FormGroup y definición de los controles
    this.registerForm = this.formBuilder.group({
      nombre: ['', [Validators.required, CustomValidators.onlyLetters, CustomValidators.minLength(3)]],
      apellido: ['', [Validators.required, CustomValidators.onlyLetters, CustomValidators.minLength(3)]],
      dni: ['', [Validators.required, CustomValidators.onlyNumbers, Validators.minLength(8), Validators.maxLength(8)]],
      edad: ['', [Validators.required, CustomValidators.onlyNumbers, Validators.min(1), Validators.max(99)]],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      foto1: ['', Validators.required],
      recaptcha: ['', Validators.required] // Agregar el control de reCAPTCHA
    });
  }

  async onSubmit() {
    if (this.registerForm && this.registerForm.valid) {
      const admin = this.registerForm.value;
      const password = this.registerForm.value.password;
  
      try {
        const adminId = await this.auth.guardarAdmin(admin, password);
        console.log('Admin registrado con ID: ', adminId);
        Swal.fire({
          position: "top-right",
          icon: "success",
          title: "Te has registrado correctamente",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        console.error('Error al registrar admin:', error);
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
  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      // Asignar archivo al control correspondiente según el índice
      this.registerForm.patchValue({ [`foto${index}`]: file });
    }
  }

  // Método para manejar la resolución del CAPTCHA
  onCaptchaResolved(captchaResponse: string) {
    this.registerForm.patchValue({ recaptcha: captchaResponse });
    this.captchaError = false; // Reinicia el error del CAPTCHA cuando se resuelve correctamente
  }
}
