import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router, RouterModule } from "@angular/router";
import * as firebase from 'firebase';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PostComponent } from '../post/post.component';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent implements OnInit {

  authState: any = null;

  @ViewChild(PostComponent) postComponent: PostComponent;

  postModal: BsModalRef;
  warnings = [];

  constructor(private modalService: BsModalService, private afAuth: AngularFireAuth, private router: Router,
    private db: AngularFirestore, ) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {
    this.getWarnings();
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

  openPostModalWithComponent() {
    this.postModal = this.modalService.show(PostComponent, {
      class: 'modal-style modal-md modal-dialog-centered',
      backdrop: 'static'
    });

  }

  getWarnings() {
    let that = this;
    this.warnings = [];

    const unsubscribe = this.db.collection("warnings").ref
      .onSnapshot(function (querySnapshot) {
        that.warnings = [];
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());

          that.warnings.push({id: doc.id, ...doc.data()});


        })
        console.log("Here are the warnngs");
        console.log(that.warnings);
        // unsubscribe();
      });
  }

  seeWarning(idWarning) {
    console.log(idWarning);
    let data = {
      seen: "yes"
    }
    this.db.collection("warnings").doc(idWarning).set(data,{ merge: true })
    .then(function (docRef) {
      console.log("Seen set yes");
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });

  }
}
