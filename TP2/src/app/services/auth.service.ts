import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  logeado = false;
  admin = false;
  usuario: any;

  constructor() { }
}
