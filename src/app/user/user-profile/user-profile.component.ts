import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from "@angular/router";
import * as firebase from 'firebase';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  authState: any = null;
  public userObject: any;
  public userObjectRetrived: any;

  constructor(private afAuth: AngularFireAuth, private router:Router) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
   }

  ngOnInit() {
    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);

  }

}
