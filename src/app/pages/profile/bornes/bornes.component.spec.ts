import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BornesComponent } from './bornes.component';

describe('BornesComponent', () => {
  let component: BornesComponent;
  let fixture: ComponentFixture<BornesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BornesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BornesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
