import { Directive, HostListener, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[appHoverTrail]',
  standalone: true
})
export class HoverTrailDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const trail = this.renderer.createElement('div');
    this.renderer.setStyle(trail, 'position', 'absolute');
    this.renderer.setStyle(trail, 'width', '7px');
    this.renderer.setStyle(trail, 'height', '7px');
    this.renderer.setStyle(trail, 'backgroundColor', 'rgba(46, 76, 109, 0.5)');
    this.renderer.setStyle(trail, 'border', '2px solid rgba(19, 45, 73, 0.5)');
    this.renderer.setStyle(trail, 'boxShadow', '0 0 5px rgba(0, 0, 0, 0.3)');
    this.renderer.setStyle(trail, 'pointerEvents', 'none');
    this.renderer.setStyle(trail, 'top', `${event.clientY - 7.5}px`);
    this.renderer.setStyle(trail, 'left', `${event.clientX - 7.5}px`);
    this.renderer.appendChild(this.el.nativeElement, trail);

    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement, trail);
    }, 300);
  }
}
