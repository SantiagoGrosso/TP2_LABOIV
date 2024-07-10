import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisTurnosPacComponent } from './mis-turnos-pac.component';

describe('MisTurnosPacComponent', () => {
  let component: MisTurnosPacComponent;
  let fixture: ComponentFixture<MisTurnosPacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisTurnosPacComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisTurnosPacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
