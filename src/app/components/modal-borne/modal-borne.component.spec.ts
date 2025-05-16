import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBorneComponent } from './modal-borne.component';

describe('ModalBorneComponent', () => {
  let component: ModalBorneComponent;
  let fixture: ComponentFixture<ModalBorneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalBorneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalBorneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
