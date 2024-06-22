import { AbstractControl, ValidatorFn } from "@angular/forms";

export class CustomValidators {
    static noNumbers(control: AbstractControl): { [key: string]: boolean } | null {
        const regex = /^[^0-9]*$/;
        if (control.value && !regex.test(control.value)) {
          return { 'noNumbers': true };
        }
        return null;
      }
    
      static minLength(length: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
          if (control.value && control.value.length < length) {
            return { 'minLength': true };
          }
          return null;
        };
      }
}
