import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { EChartsOption } from 'echarts';
import { AuthService } from '../../services/auth.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgFor } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-grafico-turnos-fin',
  templateUrl: './grafico-turnos-fin.component.html',
  styleUrls: ['./grafico-turnos-fin.component.css'],
  standalone: true,
  imports: [NgxEchartsModule, NgFor]
})
export class GraficoTurnosFinComponent implements OnInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  public option!: EChartsOption;
  public turnos: any[] = [];
  public countsTotales!: number;
  public startDate!: Date;
  public endDate!: Date;
  public startMaxDate!: string;
  public endMinDate!: string;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos(): void {
    this.authService.getTurnosRealizadosPorMedico().subscribe((turnos) => {
      this.turnos = turnos.filter(turno => turno.estado === 'realizado');
      this.updateChart();
    });
  }

  updateChart(): void {
    const filteredTurnos = this.turnos.filter(turno => {
      const turnoDate = new Date(turno.dia.split('/').reverse().join('-'));
      return (!this.startDate || turnoDate >= this.startDate) && (!this.endDate || turnoDate <= this.endDate);
    });

    const medicos = [...new Set(filteredTurnos.map(turno => turno.medico))];
    const days = [...new Set(filteredTurnos.map(turno => turno.dia))];

    // Ordenar los días en orden cronológico
    days.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    });

    const seriesData = medicos.map(medico => {
      const data = days.map(day => {
        return filteredTurnos.filter(turno => turno.medico === medico && turno.dia === day).length;
      });
      return {
        name: medico,
        type: 'line' as const,
        stack: 'total',
        areaStyle: {},
        data: data
      };
    });

    this.option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      legend: {
        data: medicos
      },
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
      series: seriesData
    };

    this.countsTotales = filteredTurnos.length;
  }

  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.startDate = input.valueAsDate!;
    this.endMinDate = input.value;
    if (this.endDate && this.startDate > this.endDate) {
      this.endDate = undefined!;
    }
    this.updateChart();
  }

  onEndDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.endDate = input.valueAsDate!;
    this.startMaxDate = input.value;
    if (this.startDate && this.endDate < this.startDate) {
      this.startDate = undefined!;
    }
    this.updateChart();
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

      pdf.save('grafico_turnos_realizados.pdf');
    });
  }
}
