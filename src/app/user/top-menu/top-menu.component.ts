import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router, RouterModule } from "@angular/router";
import * as firebase from 'firebase';

@Component({
  selector: 'top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent implements OnInit {

  authState: any = null;

  constructor(private afAuth: AngularFireAuth, private router:Router) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
   }

  ngOnInit() {
  }

    //// Sign Out ////
    signOut(): void {
      this.afAuth.auth.signOut();
      
      localStorage.removeItem('Auth');
      delete window.localStorage['Auth'];

      localStorage.removeItem('User');
      delete window.localStorage['User'];


      console.log("Info: ");
      console.log(this.authState);
      this.router.navigate(['/'])
    }
}
