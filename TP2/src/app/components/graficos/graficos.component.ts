import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraficoIngresosComponent } from '../grafico-ingresos/grafico-ingresos.component';
import { GraficoTurnosDiaComponent } from '../grafico-turnos-dia/grafico-turnos-dia.component';
import { GraficoTurnosEspComponent } from '../grafico-turnos-esp/grafico-turnos-esp.component';
import { GraficoTurnosSolComponent } from '../grafico-turnos-sol/grafico-turnos-sol.component';
import { GraficoTurnosFinComponent } from '../grafico-turnos-fin/grafico-turnos-fin.component';
import { ChangeBackgroundDirective } from '../../directives/change-background.directive';

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [ChangeBackgroundDirective, CommonModule, GraficoIngresosComponent, GraficoTurnosDiaComponent, GraficoTurnosEspComponent, GraficoTurnosSolComponent, GraficoTurnosFinComponent],
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.css']
})
export class GraficosComponent {
  selectedGrafico: string = '';

  selectGrafico(grafico: string) {
    this.selectedGrafico = grafico;
  }
}
