import { Component, EventEmitter, Output } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-botones-inicio',
  standalone: true,
  imports: [],
  templateUrl: './botones-inicio.component.html',
  styleUrls: ['./botones-inicio.component.css'],
  animations: [
    trigger('buttonContainerAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('buttonAnimation', [
      transition(':enter', [
        query('.btn', [
          style({ transform: 'translateX(-100px)', opacity: 0 }),
          stagger('0.1s', [
            animate('0.8s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
          ])
        ])
      ])
    ])
  ]
})
export class BotonesInicioComponent {
  @Output() credencialesSeleccionadas = new EventEmitter<any>();

  // Método para manejar el clic en un botón y emitir las credenciales
  seleccionarCredenciales(email: string, password: string) {
    const credenciales = {
      email: email,
      password: password
    };
    this.credencialesSeleccionadas.emit(credenciales);
  }
}
