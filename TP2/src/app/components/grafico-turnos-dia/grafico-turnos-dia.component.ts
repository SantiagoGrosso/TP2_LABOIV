import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { EChartsOption } from 'echarts';
import { AuthService } from '../../services/auth.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgFor } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-grafico-turnos-dia',
  templateUrl: './grafico-turnos-dia.component.html',
  styleUrls: ['./grafico-turnos-dia.component.css'],
  standalone: true,
  imports: [NgxEchartsModule, NgFor]
})
export class GraficoTurnosDiaComponent implements OnInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  public option!: EChartsOption;
  public turnos: any[] = [];
  public countsTotales!: number;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos(): void {
    this.authService.getTurnosPorDia().subscribe((turnos) => {
      this.turnos = turnos;
      this.updateChart();
    });
  }

  updateChart(): void {
    const days = [...new Set(this.turnos.map(turno => turno.dia))].sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
    });

    const counts = days.map(day => this.turnos.filter(turno => turno.dia === day).length);
    
    this.option = {
      xAxis: {
        type: 'category',
        data: days,
        axisLabel: {
          rotate: 90,
          formatter: function(value: string) {
            const [day, month] = value.split('/');
            return `${day}/${month}`;
          }
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: counts,
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: '#2e4c6d'
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

      // Ajuste para asegurar que el gráfico se vea completo en el PDF
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

      pdf.save('grafico_turnos_por_dia.pdf');
    });
  }
}
