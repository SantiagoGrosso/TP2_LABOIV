import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { BotonesInicioComponent } from '../botones-inicio/botones-inicio.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, BotonesInicioComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit() {
  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;
    try {
      // Iniciar sesión utilizando AuthService
      await this.authService.login(email, password);

      // Obtener el usuario actualmente autenticado
      const user = await this.authService.getCurrentUser();

      if (user) {
        // Intentar obtener datos del especialista
        const especialistaData = await this.authService.getEspecialistaData(user.uid);

        if (especialistaData) {
          // Usuario es un especialista
          if (especialistaData.habilitado === true) {
            // Especialista verificado y habilitado
            Swal.fire({
              position: "top-right",
              icon: "success",
              title: "Bienvenido especialista",
              showConfirmButton: false,
              timer: 1500,
            });
            this.router.navigate(['/inicio-especialista']);
          } else {
            // Especialista no verificado
            Swal.fire({
              position: "top-left",
              icon: "error",
              title: "Todavía no ha sido verificado",
              showConfirmButton: false,
              timer: 1500,
            });
            throw new Error('Especialista no verificado');
          }
        } else {
          // Usuario es un paciente u otro tipo de usuario
          Swal.fire({
            position: "top-right",
            icon: "success",
            title: "Bienvenido",
            showConfirmButton: false,
            timer: 1500,
          });
          this.router.navigate(['/bienvenida']);
        }
      } else {
        // Manejar el caso en el que no hay usuario autenticado
        Swal.fire({
          position: "top-left",
          icon: "error",
          title: "Usuario no encontrado",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      if (error.message === 'Especialista no verificado') {
        Swal.fire({
          position: "top-left",
          icon: "error",
          title: "Especialista no verificado",
          text: "Por favor, espere a que su cuenta sea habilitada.",
          showConfirmButton: true,
        });
      } else {
        Swal.fire({
          position: "top-left",
          icon: "error",
          title: "Credenciales incorrectas",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  }
}

  ingresoRapido(email :string , password : string)
  {
    this.loginForm.patchValue({
      email: email,
      password: password
    });
  }

  manejarCredencialesSeleccionadas(credenciales : any) {
    this.loginForm.patchValue({
      email: credenciales.email,
      password: credenciales.password
    });
  }

}
