import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router} from "@angular/router";


@Component({
  selector: 'top-menu-admin',
  templateUrl: './top-menu-admin.component.html',
  styleUrls: ['./top-menu-admin.component.scss']
})
export class TopMenuAdminComponent implements OnInit {

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
