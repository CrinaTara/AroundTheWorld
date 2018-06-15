import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
// import { FindFriendsComponent } from '../find-friends/find-friends.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-view-user-profile',
  templateUrl: './view-user-profile.component.html',
  styleUrls: ['./view-user-profile.component.scss']
})
export class ViewUserProfileComponent implements OnInit {

  authState: any = null;

  public params: any;
  userPersonalInformation: any;
  url: any;

  userListPosts = [];
  weHavePosts = false;

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
  constructor(public fb: FormBuilder, private afAuth: AngularFireAuth, private db: AngularFirestore, private route: ActivatedRoute, private router: Router) {
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
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("idUser", "==", this.params._value.id).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());

          that.userListPosts.push({id: doc.id, ...doc.data()});
          that.weHavePosts = true; 
          that.postsILiked = doc.data().likedByUsers;
          that.dublicate = doc.data().likedByUsers;
          
        })
        console.log(that.userListPosts);
        unsubscribe();
      });

  }

  getLikedPosts(){
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("idUser", "==", this.params._value.id).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {

          that.postsILiked = doc.data().likedByUsers;
          that.dublicate = doc.data().likedByUsers;  
        })
        console.log(that.userListPosts);
        unsubscribe();
      });
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
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          that.allComments.push({ id: doc.id, ...doc.data() });
          that.weHaveComments = true;
        })
        console.log(that.allComments);
        unsubscribe();
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
    

    const unsubscribe = this.db.collection("posts").doc(idPost).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document following ok");
        that.getLikedPosts();
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

    const unsubscribe = this.db.collection("posts").doc(idPost).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document following ok");
        that.getLikedPosts();
      })
      .catch((error) => {
        console.log(error);
      })
  }

}
