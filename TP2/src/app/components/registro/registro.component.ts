import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgIf } from '@angular/common';
import { HoverTrailDirective } from '../../directives/hover-trail.directive';
import { ClickMarkDirective } from '../../directives/clickmark.directive';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  animations: [
    trigger('fadeInFromBottom', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(100%)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  standalone: true,
  imports: [HoverTrailDirective, ClickMarkDirective, NgIf]
})
export class RegistroComponent {
  constructor(public router: Router) { }

  navegarPacientes() {
    this.router.navigateByUrl('/registro_pacientes');
  }

  navegarEspecialistas() {
    this.router.navigateByUrl('/registro_especialistas');
  }
}
