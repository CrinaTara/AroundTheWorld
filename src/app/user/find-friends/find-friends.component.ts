import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFirestore } from 'angularfire2/firestore';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-find-friends',
  templateUrl: './find-friends.component.html',
  styleUrls: ['./find-friends.component.scss']
})
export class FindFriendsComponent implements OnInit {

  authState: any = null;

  accesPersonPageID: any = "";

  searchResponse: boolean = false;
  searcFriendsResuls = [];

  searchFriendsForm: FormGroup;

  searchMessageDisplayed: string = '';
  errorSearchMessageDisplay: boolean = false;

  currentFollowing = [];

  constructor(private db: AngularFirestore,  public fb: FormBuilder, private afAuth: AngularFireAuth) { 
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {
    this.searchFriendsForm = this.fb.group({
      search: ['', Validators.required],
    })

    // this.getFriends();
  }

  getFriends(dataSearch){
    this.searcFriendsResuls = [];
    let that = this;

    let valueToCompare = dataSearch.search.toUpperCase();
    const locationsSubscription = this.db.collection("users").snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        if(id != that.authState.uid) {
          if (data.firstName.toUpperCase().includes(valueToCompare) || data.lastName.toUpperCase().includes(valueToCompare)) {
            return { id, ...data };
          }
        } 
        // string.includes(substring);
      });
    }).subscribe((querySnapshot) => {
      // console.log(querySnapshot)
      querySnapshot.forEach((doc) => {
        
        if (doc) {
          console.log(doc);
          {
             that.searcFriendsResuls.push(doc);
             that.searchResponse = true;
          }
        
        }
      
      });

      if(that.searcFriendsResuls.length == 0) {
        that.errorSearchMessageDisplay = true;
        that.searchMessageDisplayed = "No results found!"
      }
      else  {
        that.errorSearchMessageDisplay = false;

      }
      locationsSubscription.unsubscribe();

    });
  }

  viewPersonPage(idPerson){
    console.log(idPerson);
    this.accesPersonPageID = idPerson;
  }


  followAPerson(idPerson){
    console.log(idPerson);
    console.log(this.authState);

    this.setFollowInDB(idPerson);

  }

  setFollowInDB(idPerson){
    
    var that = this;

    // this.db.collection("users").doc(this.authState.uid).ref
    //   .onSnapshot(function (doc) {
    //     console.log(" data: ", doc.data());
    //     that.currentFollowing = doc.data().following;
    //     console.log(that.currentFollowing);
    //   }, function (error) {
    //     console.log("Error receiving data");
    // });

    //See why !

    this.db.collection("users").doc(this.authState.uid).ref.get().then(function(doc) {
      if (doc.exists) {
          console.log("Document data:", doc.data());
          that.currentFollowing = doc.data().following;

          that.currentFollowing.push(idPerson);
          let data = {
            following: that.currentFollowing
          }

        that.db.collection("users").doc(that.authState.uid).set(data, { merge: true })
            .then(function (docRef) {
              console.log("Document written ok");
            })
            .catch((error) => {
              console.log(error);
            })

      } else {
          console.log("No such document!");
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

    // this.db.collection("users").doc(this.authState.uid).ref
    // .get()
    //   .then(function (querySnapshot) {
    //     that.currentFollowing = querySnapshot.data().following;
    //     console.log(that.currentFollowing);

        
    //     that.currentFollowing.push(idPerson);
    //     let data = {
    //       following: that.currentFollowing
    //     }

    //     that.db.collection("users").doc(that.authState.uid).set(data, { merge: true })
    //         .then(function (docRef) {
    //           console.log("Document written ok");
    //         })
    //         .catch((error) => {
    //           console.log(error);
    //         })

    //   })
    //   .catch(function (error) {
    //     console.log("Error getting documents: ", error);
    //   });

  }

}
