import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
// import { FindFriendsComponent } from '../find-friends/find-friends.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-view-user-profile',
  templateUrl: './view-user-profile.component.html',
  styleUrls: ['./view-user-profile.component.scss']
})
export class ViewUserProfileComponent implements OnInit {

  public params: any;
  userPersonalInformation: any;
  url : any;

  userListPosts = [];
  weHavePosts= false;

  // @ViewChild(FindFriendsComponent) viewPerson : FindFriendsComponent;
  constructor( private db: AngularFirestore, private route: ActivatedRoute, private router: Router) { 
    this.params = this.route.params;
  }
  

  ngOnInit() {
   console.log(this.params._value.id);
   this.getUserData();
   this.getUserPosts();
  }
  
  // ngAfterViewInit(){
  //   console.log(this.viewPerson.searchMessageDisplayed);
  // }
  
  getUserData(){
    let that = this;
    this.db.collection("users").doc(this.params._value.id).ref.get().then(function(doc) {
      if (doc.exists) {
          console.log("Document data:", doc.data());
          that.userPersonalInformation = doc.data();
          that.url = (that.userPersonalInformation.profilePicture == '') ? 'assets/images/user.png' : that.userPersonalInformation.profilePicture;
      } else {
          console.log("No such document!");
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
  }

  getUserPosts(){
    let that = this;
    this.db.collection("posts").ref.where("idUser", "==", this.params._value.id).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
        .onSnapshot(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              console.log(doc.id, " => ", doc.data());

              that.userListPosts.push(doc.data());
              that.weHavePosts = true;
            })
            console.log(that.userListPosts);
          
          });
         
  }

}
