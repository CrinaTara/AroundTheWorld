import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
// import { FindFriendsComponent } from '../find-friends/find-friends.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

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

  isFollowing: boolean = false;

  // @ViewChild(FindFriendsComponent) viewPerson : FindFriendsComponent;
  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore, private route: ActivatedRoute, private router: Router) {
    this.params = this.route.params;

    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });

  }


  ngOnInit() {
    this.getTheFollowingPersons();
    console.log(this.params._value.id);
    this.getUserData();
    this.getUserPosts();
    this.getFollowersFromIdPerson();
  }

  // ngAfterViewInit(){
  //   console.log(this.viewPerson.searchMessageDisplayed);
  // }

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
    this.db.collection("posts").ref.where("idUser", "==", this.params._value.id).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());

          that.userListPosts.push(doc.data());
          that.weHavePosts = true;
        })
        console.log(that.userListPosts);

      });

  }


  getTheFollowingPersons() {

    let that = this;


    const unsubscribe = this.db.collection("users").doc(this.authState.uid).ref
      .onSnapshot(function (doc) {
        // console.log(" data: ", doc.data());
        that.currentFollowing = doc.data().following;
        that.isFollowing = that.currentFollowing.includes(that.params._value.id);
        console.log("Following: " + that.currentFollowing);
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
      })
      .catch((error) => {
        console.log(error);
      })

    that.db.collection("users").doc(that.params._value.id).set(dataFollowers, { merge: true })
      .then(function (docRef) {
        console.log("Document followers written ok");
        that.getTheFollowingPersons();
      })
      .catch((error) => {
        console.log(error);
      })


  }

}
