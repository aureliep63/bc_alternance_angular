import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBorneDetailComponent } from './modal-borne-detail.component';

describe('ModalBorneViewComponent', () => {
  let component: ModalBorneDetailComponent;
  let fixture: ComponentFixture<ModalBorneDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalBorneDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalBorneDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
