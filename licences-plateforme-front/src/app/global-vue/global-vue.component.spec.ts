import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalVueComponent } from './global-vue.component';

describe('GlobalVueComponent', () => {
  let component: GlobalVueComponent;
  let fixture: ComponentFixture<GlobalVueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalVueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalVueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
