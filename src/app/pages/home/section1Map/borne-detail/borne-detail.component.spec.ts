import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorneDetailComponent } from './borne-detail.component';

describe('BorneDetailComponent', () => {
  let component: BorneDetailComponent;
  let fixture: ComponentFixture<BorneDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BorneDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BorneDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
