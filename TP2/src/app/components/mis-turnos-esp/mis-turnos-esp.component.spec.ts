import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisTurnosEspComponent } from './mis-turnos-esp.component';

describe('MisTurnosEspComponent', () => {
  let component: MisTurnosEspComponent;
  let fixture: ComponentFixture<MisTurnosEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisTurnosEspComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisTurnosEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
