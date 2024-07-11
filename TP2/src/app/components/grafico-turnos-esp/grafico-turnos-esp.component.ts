import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { EChartsOption } from 'echarts';
import { AuthService } from '../../services/auth.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgFor } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-grafico-turnos-esp',
  templateUrl: './grafico-turnos-esp.component.html',
  styleUrls: ['./grafico-turnos-esp.component.css'],
  standalone: true,
  imports: [NgxEchartsModule, NgFor]
})
export class GraficoTurnosEspComponent implements OnInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  public option!: EChartsOption;
  public turnos: any[] = [];
  public countsTotales!: number;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos(): void {
    this.authService.getTurnosPorEspecialidad().subscribe((turnos) => {
      this.turnos = turnos;
      this.updateChart();
    });
  }

  updateChart(): void {
    const especialidades = [...new Set(this.turnos.map(turno => turno.especialidad))];
    const counts = especialidades.map(especialidad => this.turnos.filter(turno => turno.especialidad === especialidad).length);
    
    const data = especialidades.map((especialidad, index) => ({
      name: especialidad,
      value: counts[index]
    }));

    this.option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: especialidades
      },
      series: [
        {
          name: 'Turnos por Especialidad',
          type: 'pie',
          radius: '50%',
          data: data,
          itemStyle: {
            color: function (params: any) {
              const colors = ['#2e4c6d', '#132d49', '#d2691e', '#a0522d', '#8b4513'];
              return colors[params.dataIndex % colors.length];
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    this.countsTotales = counts.reduce((acumulador, numero) => acumulador + numero, 0);
  }

  public onPdfDownload(): void {
    html2canvas(this.chartContainer.nativeElement, { scale: 3 }).then(canvas => {
      const image = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(image, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(image, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('grafico_turnos_por_especialidad.pdf');
    });
  }
}
