import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
// import { FindFriendsComponent } from '../find-friends/find-friends.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdvancedLayout, Image, PlainGalleryConfig, PlainGalleryStrategy } from 'angular-modal-gallery';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-view-user-profile',
  templateUrl: './view-user-profile.component.html',
  styleUrls: ['./view-user-profile.component.scss']
})
export class ViewUserProfileComponent implements OnInit {

  authState: any = null;

  imagesToDisplay: Image[] = [];
  idPostToDelete: any;
  
  modalRef: BsModalRef;
  userToDelete:any;
  
  public params: any;
  userPersonalInformation: any;
  url: any;

  userListPosts = [];
  weHavePosts = false;
  userDeletedMessage = false;

  currentFollowing = [];
  currentFollowers = [];
  postsILiked = [];
  dublicate = [];

  weHaveComments: boolean = false;
  allComments: any = [];
  writeComment: FormGroup;

  isFollowing: boolean = false;
  public userObject: any;
  public userObjectRetrived: any;

  // @ViewChild(FindFriendsComponent) viewPerson : FindFriendsComponent;
  constructor(public fb: FormBuilder, 
    private modalService: BsModalService, private afAuth: AngularFireAuth, private db: AngularFirestore, private route: ActivatedRoute, private router: Router) {
    this.params = this.route.params;

    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });

  }


  ngOnInit() {

    this.writeComment = this.fb.group({
      commentText: ['', Validators.required],
    })

    
    this.getTheFollowingPersons();
    console.log(this.params._value.id);
    this.getComments();
    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);
    
    this.getUserData();
    this.getUserPosts();
    this.getFollowersFromIdPerson();
    // this.getLikedPosts();
  }


  getUserData() {
    let that = this;
    this.db.collection("users").doc(this.params._value.id).ref.get().then(function (doc) {
      if (doc.exists) {
        console.log("User data:", doc.data());
        that.userPersonalInformation = doc.data();
        that.url = (that.userPersonalInformation.profilePicture == '') ? 'assets/images/user.png' : that.userPersonalInformation.profilePicture;
      } else {
        console.log("No such document!");
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });
  }

  getUserPosts() {
    this.userListPosts = [];
    this.postsILiked = [];
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("idUser", "==", this.params._value.id).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        that.userListPosts = [];
        that.postsILiked = [];
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          that.postsILiked = [];
          let images: Image[] = [];

          for(let i= 0 ; i< doc.data().photos.length; i++){
            images.push(new Image(i, {
              img: doc.data().photos[i]
            }))
          }

          for(let i in doc.data().likedByUsers){
            that.postsILiked.push(doc.data().likedByUsers[i]) ;
          }    

          let th = that;
          that.userListPosts.push({id: doc.id, ...doc.data(), images: images, dublicate: th.postsILiked});
          that.weHavePosts = true; 
          
        })
        console.log(that.userListPosts);
        // unsubscribe();
      });

  }

  
  openModal(template: TemplateRef<any>, idPost, shortName) {

    this.modalRef = this.modalService.show(template, { class: 'modal-md modal-dialog-centered' });
    this.idPostToDelete = idPost;

  }

  confirm(): void {
    this.deleteAPost();
    this.modalRef.hide();
  }

  decline(): void {
    this.modalRef.hide();
  }

  deleteAPost() {
    console.log(this.idPostToDelete);
    const that = this;
    this.db.collection("posts").doc(this.idPostToDelete).delete().then(function () {
      console.log("Document successfully deleted!");
      that.deleteCommentPosts(that.idPostToDelete);
     
      // that.getMyPosts();
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }

  deleteCommentPosts(idToDeletePost) {
    let that = this;

    const unsubscribe = this.db.collection("comments").ref
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          if (doc.data().idPost == idToDeletePost) {
            that.db.collection("comments").doc(doc.id).delete().then(function () {
              console.log("Document successfully deleted!");
            }).catch(function (error) {
              console.error("Error removing document: ", error);
            });
          }

        })

        unsubscribe();
      });

  }


  
  openDeleteUserModal(deleteUser: TemplateRef<any>, idUser) {

    this.userToDelete = idUser;
    console.log(this.userToDelete);
    this.modalRef = this.modalService.show(deleteUser, { class: 'modal-md modal-dialog-centered' });
   
  }

  confirmDeleteUser(): void {
    this.deleteAUser();
    this.modalRef.hide();
  }

  deleteAUser(){
    console.log("delete");
    console.log(this.userToDelete);
    const that = this;
    this.db.collection("users").doc(that.params._value.id).delete().then(function () {
      console.log("Document successfully deleted!");
      that.userDeletedMessage = true;
      // that.getAllUsers();
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }

  customPlainGalleryRowConfig: PlainGalleryConfig = {
    strategy: PlainGalleryStrategy.CUSTOM,
    layout: new AdvancedLayout(-1, true)
  };
  
  openImageModalRow(image: Image, images) {
    this.imagesToDisplay = images;
    console.log(this.imagesToDisplay);
    console.log('Opening modal gallery from custom plain gallery row, with image: ', image);
    const index: number = this.getCurrentIndexCustomLayout(image, this.imagesToDisplay);
    this.customPlainGalleryRowConfig = Object.assign({}, this.customPlainGalleryRowConfig, { layout: new AdvancedLayout(index, true) });
  }

  private getCurrentIndexCustomLayout(image: Image, imagesToDisplay: Image[]): number {
    return image ? imagesToDisplay.indexOf(image) : -1;
  }


  getTheFollowingPersons() {

    let that = this;


    const unsubscribe = this.db.collection("users").doc(this.authState.uid).ref
      .onSnapshot(function (doc) {
        console.log(" data: ", doc.data());
        that.currentFollowing = doc.data().following;
        that.isFollowing = that.currentFollowing.includes(that.params._value.id);
       
        console.log("Following: " + that.currentFollowing);
        console.log("Liked posts: " + that.postsILiked);
        unsubscribe();
      }, function (error) {
        console.log("Error receiving data");
      });

  }

  unfollowAPerson() {
    console.log("Following: " + this.currentFollowing);
    console.log("Followers: " + this.currentFollowers);
    const index1: number = this.currentFollowing.indexOf(this.params._value.id);
    if (index1 !== -1) {
      this.currentFollowing.splice(index1, 1);
    }

    const index2: number = this.currentFollowers.indexOf(this.authState.uid);
    if (index2 !== -1) {
      this.currentFollowers.splice(index2, 1);
    }

    this.setDB();

  }

  getFollowersFromIdPerson() {
    let that = this;

    const unsubscribe = this.db.collection("users").doc(that.params._value.id).ref
      .onSnapshot(function (doc) {
        console.log(" Followers: ", doc.data());
        that.currentFollowers = doc.data().followers;
        console.log(that.currentFollowers);
        unsubscribe();
      }, function (error) {
        console.log("Error receiving data");
      });
  }

  followPerson() {
    console.log("Following: " + this.currentFollowing);
    console.log("Followers: " + this.currentFollowers);
    this.currentFollowing.push(this.params._value.id);
    this.currentFollowers.push(this.authState.uid);
    this.setDB();
  }

  updateLocalStorage() {
    const unsubscribe = this.db.collection("users").doc(this.authState.uid).ref
      .onSnapshot(function (doc) {
        // var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log("UPDATE LOCAL")
        console.log(" data: ", doc.data());
        localStorage.setItem('User', JSON.stringify(doc.data()));
        unsubscribe();
      }, function (error) {
        console.log("Eroor local storage");
      });
  }

  addCommentToDB(valueData, IDPost){
    console.log("ENTER KEY PRESS");
    console.log(valueData);
    var that = this;
    let now = moment();
    this.db.collection("comments").add({

      idPost: IDPost,
      commentText: valueData.commentText,
      creationDate: now.format('L'),
      creationHour: now.format('LT'),
      by :{
        idUser: this.authState.uid,
        userName: this.userObject.firstName + " " + this.userObject.lastName
      }

    })
      .then(function (docRef) {
        console.log("Document successfully written!");
        that.writeComment.patchValue({
          commentText: '',
        });
        // that.allComments = [];
        // that.getComments();
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
       
      });
  }

  getComments(){
    let that = this;

    const unsubscribe = this.db.collection("comments").ref.orderBy("creationDate", "asc").orderBy("creationHour", "asc")
      .onSnapshot(function (querySnapshot) {
        that.allComments = [];
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          that.allComments.push({ id: doc.id, ...doc.data() });
          that.weHaveComments = true;
        })
        console.log(that.allComments);
        // unsubscribe();
      });
  }


  setDB() {
    let dataFollowers = {
      followers: this.currentFollowers
    }

    let dataFollowing = {
      following: this.currentFollowing
    }

    let that = this;

    const unsubscribe = that.db.collection("users").doc(that.authState.uid).set(dataFollowing, { merge: true })
      .then(function (docRef) {
        console.log("Document following ok");
        that.updateLocalStorage();
      })
      .catch((error) => {
        console.log(error);
      })

    that.db.collection("users").doc(that.params._value.id).set(dataFollowers, { merge: true })
      .then(function (docRef) {
        console.log("Document followers written ok");
        that.getTheFollowingPersons();
        that.updateLocalStorage();
      })
      .catch((error) => {
        console.log(error);
      })


  }

  likeAPost(idPost){
    console.log(idPost);
    console.log(this.postsILiked);
    this.postsILiked.push(this.authState.uid);

    let data = {
      likedByUsers:  this.postsILiked
    }

    let that = this;
    console.log("Post I like : " + data);

    const unsubscribe = this.db.collection("posts").doc(idPost).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document following ok");
        // that.getLikedPosts();
      })
      .catch((error) => {
        console.log(error);
      })
  }


  dislikeAPost(idPost){

    const index2: number = this.postsILiked.indexOf(this.authState.uid);
    if (index2 !== -1) {
      this.postsILiked.splice(index2, 1);
    }

    let data = {
      likedByUsers:  this.postsILiked
    }

    let that = this;

    console.log("Post I like : " + data);


    const unsubscribe = this.db.collection("posts").doc(idPost).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document following ok");
        // that.getLikedPosts();
      })
      .catch((error) => {
        console.log(error);
      })
  }

}
