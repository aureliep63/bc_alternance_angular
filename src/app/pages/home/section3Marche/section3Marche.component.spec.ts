import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section3MarcheComponent } from './section3Marche.component';

describe('Section3Component', () => {
  let component: Section3MarcheComponent;
  let fixture: ComponentFixture<Section3MarcheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Section3MarcheComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Section3MarcheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
