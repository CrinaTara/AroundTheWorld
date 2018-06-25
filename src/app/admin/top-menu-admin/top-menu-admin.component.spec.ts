import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopMenuAdminComponent } from './top-menu-admin.component';

describe('TopMenuAdminComponent', () => {
  let component: TopMenuAdminComponent;
  let fixture: ComponentFixture<TopMenuAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopMenuAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopMenuAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
