import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  constructor(private router : Router) {}
  
  async ngOnInit(){

  }

  public async OnLogOutClick()
  {
    this.router.navigateByUrl('home');
  }

  public onProfileClick()
  {
    this.router.navigateByUrl('profile');
  }

  public onTurnosClick()
  {
    
  }
}
