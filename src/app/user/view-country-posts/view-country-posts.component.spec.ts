import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCountryPostsComponent } from './view-country-posts.component';

describe('ViewCountryPostsComponent', () => {
  let component: ViewCountryPostsComponent;
  let fixture: ComponentFixture<ViewCountryPostsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCountryPostsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCountryPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
