import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberToWords',
  standalone: true
})
export class NumberToWordsPipe implements PipeTransform {

  private unidades: string[] = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  private decenas: string[] = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  private especiales: { [key: number]: string } = {
    11: 'once',
    12: 'doce',
    13: 'trece',
    14: 'catorce',
    15: 'quince',
    16: 'dieciséis',
    17: 'diecisiete',
    18: 'dieciocho',
    19: 'diecinueve'
  };

  transform(value: number, ...args: unknown[]): string {
    if (value < 10) {
      return this.unidades[value];
    } else if (value < 20) {
      return this.especiales[value] || this.unidades[value];
    } else if (value < 100) {
      const unidad = value % 10;
      const decena = Math.floor(value / 10);
      return this.decenas[decena] + (unidad ? ' y ' + this.unidades[unidad] : '');
    } else {
      return 'número muy grande';
    }
  }
}
