import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section1MapComponent } from './section1Map.component';

describe('MapBorneComponent', () => {
  let component: Section1MapComponent;
  let fixture: ComponentFixture<Section1MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Section1MapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Section1MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
