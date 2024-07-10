import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Observable, of, take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface DatoDinamico {
  clave: string;
  valor: string;
}

interface HistoriaClinica {
  especialidad: string;
  altura: number;
  peso: number;
  temperatura: number;
  presion: number;
  datosDinamicos: DatoDinamico[];
}

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [NgIf, CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css'],
  animations: [
    trigger('fadeInFromBottom', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(100%)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MiPerfilComponent {
  user$: Observable<any>;
  historiasClinicas: HistoriaClinica[] = [];
  especialidades: string[] = [];
  especialidadSeleccionada: string = '';
  horarioMañana: boolean = false;
  horarioTarde: boolean = false;
  mostrarModal: boolean = false;

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.user$ = of(null);  // Inicialización
  }

  ngOnInit(): void {
    this.user$ = this.authService.getCurrentUserData();
    this.user$.subscribe(user => {
      if (user?.role === 'paciente' && user.data?.uid) {
        this.loadHistoriasClinicas(user.data.uid);
      }
    });
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

  async loadHistoriasClinicas(uid: string): Promise<void> {
    try {
      this.historiasClinicas = await this.authService.getHistoriasClinicasByPaciente(uid);
      this.especialidades = Array.from(new Set(this.historiasClinicas.map(hc => hc.especialidad)));
      console.log(this.especialidades); // Verifica que las especialidades se estén obteniendo correctamente
    } catch (error) {
      console.error('Error al cargar las historias clínicas:', error);
    }
  }

  abrirModalEspecialidades(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  confirmarEspecialidad(): void {
    this.cerrarModal();
    if (this.especialidadSeleccionada) {
      this.descargarHistoriasClinicas();
    }
  }

  async descargarHistoriasClinicas(): Promise<void> {
    const especialidad = this.especialidadSeleccionada;
  
    if (especialidad) {
      this.user$.pipe(take(1)).subscribe(user => {
        const nombrePaciente = user?.data?.nombre; // Obtener el nombre del paciente
  
        if (nombrePaciente) {
          try {
            const historiasFiltradas = this.historiasClinicas.filter(hc => hc.especialidad === especialidad);
            if (historiasFiltradas.length > 0) {
              const doc = new jsPDF();
              doc.addImage('assets/icono.png', 'PNG', 10, 10, 50, 15); // Añadir el logo de la clínica
              doc.setFontSize(18);
              doc.text('Informe de Historias Clínicas', 70, 20);
              doc.setFontSize(12);
              doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 70, 30);
              autoTable(doc, {
                startY: 40,
                head: [['Altura', 'Peso', 'Temperatura', 'Presión', 'Datos Dinámicos']],
                body: historiasFiltradas.map(hc => [
                  hc.altura,
                  hc.peso,
                  hc.temperatura,
                  hc.presion,
                  hc.datosDinamicos.map((dato: DatoDinamico) => `${dato.clave}: ${dato.valor}`).join(', ')
                ])
              });
              const fileName = `historias_clinicas_${nombrePaciente}_${especialidad}.pdf`;
              doc.save(fileName);
            } else {
              Swal.fire('No hay historias clínicas para la especialidad seleccionada.');
            }
          } catch (error: any) {
            console.error('Error al descargar las historias clínicas:', error);
            Swal.fire('Error al descargar las historias clínicas.');
          }
        } else {
          Swal.fire('No se pudo obtener el nombre del paciente.');
        }
      });
    }
  }
}
