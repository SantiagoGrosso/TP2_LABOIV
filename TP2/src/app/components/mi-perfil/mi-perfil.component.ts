import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent {

  user$: Observable<any>;
  horarioMañana: boolean = false;
  horarioTarde: boolean = false;

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.user$ = of(null);  // Inicialización
  }

  ngOnInit(): void {
    this.user$ = this.authService.getCurrentUserData();
  }

  toggleHorario(horario: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
    
    if (horario === 'mañana') {
      this.horarioMañana = checked;
    } else if (horario === 'tarde') {
      this.horarioTarde = checked;
    }
  }

  async guardarHorarios(): Promise<void> {
    const horarios: string[] = [];
    if (this.horarioMañana) horarios.push('Mañana');
    if (this.horarioTarde) horarios.push('Tarde');

    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        await this.afs.collection('especialistas').doc(user.uid).update({ horarios });
        Swal.fire({
          position: "top-right",
          icon: "success",
          title: "Horarios guardados correctamente",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          position: "top-left",
          icon: "error",
          title: "Error al guardar horarios, no se encontró el usuario",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error('Error al guardar los horarios:', error);
      Swal.fire({
        position: "top-left",
        icon: "error",
        title: "Error al guardar los horarios",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

}
