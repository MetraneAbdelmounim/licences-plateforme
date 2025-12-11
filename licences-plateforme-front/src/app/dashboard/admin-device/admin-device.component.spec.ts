import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDeviceComponent } from './admin-device.component';

describe('AdminDeviceComponent', () => {
  let component: AdminDeviceComponent;
  let fixture: ComponentFixture<AdminDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminDeviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
