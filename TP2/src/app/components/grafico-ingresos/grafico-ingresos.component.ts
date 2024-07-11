import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EChartsOption } from 'echarts';
import { AuthService } from '../../services/auth.service';
import html2canvas from 'html2canvas';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgFor } from '@angular/common';
import jsPDF from 'jspdf';

interface Ingreso {
  nombre: string;
  apellido: string;
  dia: string;
  horario: string;
}

@Component({
  selector: 'app-grafico-ingresos',
  templateUrl: './grafico-ingresos.component.html',
  styleUrls: ['./grafico-ingresos.component.css'],
  standalone: true,
  imports: [NgxEchartsModule, NgFor]
})
export class GraficoIngresosComponent implements OnInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  public option!: EChartsOption;
  public ingresos: Ingreso[] = [];
  public selectedDay: string = '';
  public selectedIngresos: Ingreso[] = [];
  public countsTotales!: number;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarIngresos();
  }

  cargarIngresos(): void {
    this.authService.getIngresos().subscribe((ingresos) => {
      this.ingresos = ingresos;
      this.updateChart();
    });
  }

  updateChart(): void {
    const days = [...new Set(this.ingresos.map(ingreso => ingreso.dia))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const counts = days.map(day => this.ingresos.filter(ingreso => ingreso.dia === day).length);

    this.option = {
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: days,
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: counts,
          type: 'line',
          areaStyle: {}
        }
      ]
    };

    this.countsTotales = counts.reduce((acumulador, numero) => acumulador + numero, 0);
  }

  onChartClick(event: any): void {
    if (event.name) {
      this.selectedDay = event.name;
      this.selectedIngresos = this.ingresos.filter(ingreso => ingreso.dia === this.selectedDay);
    }
  }

  public onPdfDownload(): void {
    html2canvas(this.chartContainer.nativeElement, { scale: 4 }).then(canvas => {
      const image = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', [canvas.width * 0.264583, canvas.height * 0.264583]); // Ajuste del tamaño del PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(image, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('grafico_ingresos.pdf');
    });
  }
}
