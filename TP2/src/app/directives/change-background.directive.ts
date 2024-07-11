import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appChangeBackground]',
  standalone: true
})
export class ChangeBackgroundDirective implements OnInit {

  private backgrounds: string[] = [
    '../../../assets/fondo-pacientes.jpg',
    '../../../assets/fondo2.jpg',
    '../../../assets/fondo3.jpg',
    '../../../assets/fondo4.jpg',
    '../../../assets/fondo5.jpg'
  ];

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.changeBackground();
  }

  private changeBackground() {
    const randomIndex = Math.floor(Math.random() * this.backgrounds.length);
    const randomBackground = this.backgrounds[randomIndex];
    this.renderer.setStyle(this.el.nativeElement, 'background-image', `url(${randomBackground})`);
  }
}
