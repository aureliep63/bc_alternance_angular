import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleUserComponent } from './reservationsProprioLoca.component';

describe('RoleUserComponent', () => {
  let component: RoleUserComponent;
  let fixture: ComponentFixture<RoleUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoleUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
