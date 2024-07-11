import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoTurnosEspComponent } from './grafico-turnos-esp.component';

describe('GraficoTurnosEspComponent', () => {
  let component: GraficoTurnosEspComponent;
  let fixture: ComponentFixture<GraficoTurnosEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoTurnosEspComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoTurnosEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
