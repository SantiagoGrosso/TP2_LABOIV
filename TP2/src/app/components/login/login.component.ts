import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { BotonesInicioComponent } from '../botones-inicio/botones-inicio.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { UppercasePipe } from '../../pipes/uppercase.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, BotonesInicioComponent, UppercasePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('loginAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-1000px)', opacity: 0 }),
        animate('1s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('botonesInicioAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('0.8s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
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
          // Obtener el rol del usuario
          const { role, data } = await this.authService.getUserRole(user.uid);
  
          if (role === 'especialista') {
            // Usuario es un especialista
            if (data.habilitado === true) {
              // Especialista verificado y habilitado
              Swal.fire({
                position: "top-right",
                icon: "success",
                title: "Bienvenido especialista",
                showConfirmButton: false,
                timer: 1500,
              });
              this.router.navigate(['/bienvenida']);
            } else {
              // Especialista no verificado
              Swal.fire({
                position: "top-left",
                icon: "error",
                title: "Todavía no ha sido verificado",
                showConfirmButton: false,
                timer: 1500,
              });
              await this.authService.logout(); // Asegúrate de cerrar la sesión
              throw new Error('Especialista no verificado');
            }
          } else if (role === 'admin') {
            // Usuario es un administrador
            Swal.fire({
              position: "top-right",
              icon: "success",
              title: "Bienvenido administrador",
              showConfirmButton: false,
              timer: 1500,
            });
            this.router.navigate(['/bienvenida']);
          } else if (role === 'paciente') {
            // Usuario es un paciente
            Swal.fire({
              position: "top-right",
              icon: "success",
              title: "Bienvenido paciente",
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
        if (error.message === 'Email no verificado') {
          Swal.fire({
            position: "top-left",
            icon: "error",
            title: "Correo no verificado",
            text: "Por favor, verifica tu correo electrónico antes de iniciar sesión.",
            showConfirmButton: true,
          });
        } else if (error.message === 'Especialista no verificado') {
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
