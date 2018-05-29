import { Component, OnInit, ViewChild, TemplateRef  } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from "@angular/router";
import * as firebase from 'firebase';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PostComponent } from '../post/post.component';
import { AngularFirestore } from 'angularfire2/firestore';
import { } from 'angular-modal-gallery';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  allMyPosts = [];
  @ViewChild(PostComponent)  postComponent: PostComponent;

  postModal : BsModalRef;
  weHavePosts= false;

  authState: any = null;
  public userObject: any;
  public userObjectRetrived: any;
  private url: any;
  idPostToDelete: any;

  modalRef: BsModalRef;

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


  getMyPosts = function (){
    let that = this;
    this.allMyPosts = [];
    const unsubscribe = this.db.collection("posts").ref.where("idUser", "==", this.authState.uid).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
    .onSnapshot(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          console.log(doc.id, " => ", doc.data());
          that.allMyPosts.push({id: doc.id, ...doc.data()});
          that.weHavePosts = true;
        })
        console.log(that.allMyPosts);
        unsubscribe();
      });

     

    // this.db.collection("posts").snapshotChanges().map(actions => {
    //   return actions.map(a => {
    //     const data = a.payload.doc.data();
    //     const id = a.payload.doc.id;
    //     console.log(data.idUser);
    //     if (data.idUser == this.authState.uid) {
    //       return { id, ...data };
    //     }

    //   });
    // }).subscribe((querySnapshot) => {
    //   // that.allMyPosts = querySnapshot;
    //   // console.log(that.allMyPosts)
    //   querySnapshot.forEach((doc) => {
        
    //     if (doc) {
    //       console.log(doc);
    //       that.allMyPosts.push(doc);
    //       that.weHavePosts = true;
    //     }
      
    //   });

    // });
  }

  deleteAPost(){
    console.log( this.idPostToDelete);
    const that = this;
    this.db.collection("posts").doc(this.idPostToDelete).delete().then(function() {
      console.log("Document successfully deleted!");
      that.getMyPosts();
     }).catch(function(error) {
      console.error("Error removing document: ", error);
     });
  }

  openModal(template: TemplateRef<any>, idPost) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
    this.idPostToDelete = idPost;
  }
 
  confirm(): void {
    this.deleteAPost();
    this.modalRef.hide();
  }
 
  decline(): void {
    this.modalRef.hide();
  }

}
