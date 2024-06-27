import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonesInicioComponent } from './botones-inicio.component';

describe('BotonesInicioComponent', () => {
  let component: BotonesInicioComponent;
  let fixture: ComponentFixture<BotonesInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonesInicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotonesInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
