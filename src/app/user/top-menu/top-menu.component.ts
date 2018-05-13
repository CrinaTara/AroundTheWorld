import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router, RouterModule } from "@angular/router";
import * as firebase from 'firebase';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PostComponent } from '../post/post.component';


@Component({
  selector: 'top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent implements OnInit {

  authState: any = null;

  @ViewChild(PostComponent)  postComponent: PostComponent;

  postModal : BsModalRef;

  constructor(private modalService: BsModalService, private afAuth: AngularFireAuth, private router:Router) {
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

    openPostModalWithComponent(){
      this.postModal = this.modalService.show(PostComponent, {
        class: 'modal-style modal-md modal-dialog-centered',
        backdrop: 'static'
      });
  
    }
}
