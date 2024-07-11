import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoTurnosSolComponent } from './grafico-turnos-sol.component';

describe('GraficoTurnosSolComponent', () => {
  let component: GraficoTurnosSolComponent;
  let fixture: ComponentFixture<GraficoTurnosSolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoTurnosSolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoTurnosSolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
