import { AbstractControl, ValidatorFn } from "@angular/forms";

export class CustomValidators {

  static onlyLetters(control: AbstractControl): { [key: string]: boolean } | null {
    const regex = /^[a-zA-Z]*$/; // Expresión regular que verifica si el valor consiste solo en letras (mayúsculas y minúsculas)

    if (control.value && !regex.test(control.value)) {
      return { 'onlyLetters': true }; // Retorna un objeto si la validación falla
    }

    return null; // Retorna null si la validación es exitosa
  }

  static onlyNumbers(control: AbstractControl): { [key: string]: boolean } | null {
    const regex = /^[0-9]*$/; // Expresión regular que verifica si el valor consiste solo en números

    if (control.value && !regex.test(control.value)) {
      return { 'onlyNumbers': true }; // Retorna un objeto si la validación falla
    }

    return null; // Retorna null si la validación es exitosa
  }

  static minLength(length: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value && control.value.length < length) {
        return { 'minLength': true };
      }
      return null;
    };
  }

  static maxLength(length: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value && control.value.length > length) {
        return { 'maxLength': true };
      }
      return null;
    };
  }
}

