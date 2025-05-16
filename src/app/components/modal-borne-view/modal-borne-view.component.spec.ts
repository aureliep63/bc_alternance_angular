import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBorneViewComponent } from './modal-borne-view.component';

describe('ModalBorneViewComponent', () => {
  let component: ModalBorneViewComponent;
  let fixture: ComponentFixture<ModalBorneViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalBorneViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalBorneViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
