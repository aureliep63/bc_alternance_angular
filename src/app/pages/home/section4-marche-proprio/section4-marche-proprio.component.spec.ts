import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section4MarcheProprioComponent } from './section4-marche-proprio.component';

describe('Section4MarcheProprioComponent', () => {
  let component: Section4MarcheProprioComponent;
  let fixture: ComponentFixture<Section4MarcheProprioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Section4MarcheProprioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Section4MarcheProprioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
