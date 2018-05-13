import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from "@angular/router";
import * as firebase from 'firebase';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PostComponent } from '../post/post.component';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  allMyPosts = [];
  @ViewChild(PostComponent)  postComponent: PostComponent;

  postModal : BsModalRef;

  authState: any = null;
  public userObject: any;
  public userObjectRetrived: any;
  private url: any;

  constructor(private db: AngularFirestore, private modalService: BsModalService, private afAuth: AngularFireAuth, private router:Router) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
    
   }

  ngOnInit() {

    this.getMyPosts();
    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);

    this.url = (this.userObject.profilePicture == '') ? 'assets/images/user.png' : this.userObject.profilePicture;
  }

  openPostModalWithComponent(){
    this.postModal = this.modalService.show(PostComponent, {
      class: 'modal-style modal-md modal-dialog-centered',
      backdrop: 'static'
    });

  }


  getMyPosts(){
    let that = this;
    this.db.collection("posts").snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        console.log(data.idUser);
        if (data.idUser == this.authState.uid) {
          return { id, ...data };
        }

      });
    }).subscribe((querySnapshot) => {
      // that.allMyPosts = querySnapshot;
      // console.log(that.allMyPosts)
      querySnapshot.forEach((doc) => {
        
        if (doc) {
          console.log(doc);
          that.allMyPosts.push(doc);
        }
      
      });

    });
  }

}
