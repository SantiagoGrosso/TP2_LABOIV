import { Directive, HostListener, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[appClickMark]',
  standalone: true
})
export class ClickMarkDirective {
  private markSize = 20;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const mark = this.renderer.createElement('div');
    this.renderer.addClass(mark, 'click');
    this.renderer.setStyle(mark, 'position', 'absolute');
    this.renderer.setStyle(mark, 'width', `${this.markSize}px`);
    this.renderer.setStyle(mark, 'height', `${this.markSize}px`);
    this.renderer.setStyle(mark, 'backgroundColor', 'rgba(19, 45, 73, 0.5)');
    this.renderer.setStyle(mark, 'pointerEvents', 'none');
    this.renderer.setStyle(mark, 'transform', 'translate(-50%, -50%)');

    // Calcular la posición exacta dentro del contenedor y ajustar el top para que esté más abajo
    const rect = this.el.nativeElement.getBoundingClientRect();
    const top = event.clientY - rect.top + 85; // Ajuste de 20px hacia abajo
    const left = event.clientX - rect.left;

    this.renderer.setStyle(mark, 'top', `${top}px`);
    this.renderer.setStyle(mark, 'left', `${left}px`);

    this.renderer.appendChild(this.el.nativeElement, mark);

    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement, mark);
    }, 500); // Tiempo de espera para eliminar la marca

    this.markSize += 10; // Incrementar el tamaño en 10 px
  }
}
