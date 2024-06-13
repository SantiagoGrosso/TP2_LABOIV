import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  constructor(public formBuilder: FormBuilder, public router: Router) {
  }

  navegarPacientes()
  {
    this.router.navigateByUrl('/registro_pacientes');
  }

  navegarEspecialistas()
  {
    this.router.navigateByUrl('/registro_especialistas');
  }

}
