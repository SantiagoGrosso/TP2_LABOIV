import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoTurnosFinComponent } from './grafico-turnos-fin.component';

describe('GraficoTurnosFinComponent', () => {
  let component: GraficoTurnosFinComponent;
  let fixture: ComponentFixture<GraficoTurnosFinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoTurnosFinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoTurnosFinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
