import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabilitarEspecialistasComponent } from './habilitar-especialistas.component';

describe('HabilitarEspecialistasComponent', () => {
  let component: HabilitarEspecialistasComponent;
  let fixture: ComponentFixture<HabilitarEspecialistasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabilitarEspecialistasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabilitarEspecialistasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
