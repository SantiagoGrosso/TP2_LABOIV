import { CommonModule, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  isAdmin: boolean = false;
  isEspecialista: boolean = false;
  isPaciente: boolean = false;
  isLoggedIn$ = this.auth.isLoggedIn$;
  private roleSubscription!: Subscription;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.roleSubscription = this.auth.role$.subscribe(role => {
      this.isAdmin = role.esAdmin;
      this.isEspecialista = role.esEspecialista;
      this.isPaciente = role.esPaciente;
    });
  }

  ngOnDestroy(): void {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  public async OnLogOutClick() {
    await this.auth.logout();
    this.router.navigateByUrl('home');
  }
}