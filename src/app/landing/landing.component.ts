import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  iconHide = true;
  constructor() { }

  ngOnInit() {
  }

  scroll(el) {
   el.scrollIntoView({behavior:"smooth"});
   this.iconHide = false;
}
  
}
