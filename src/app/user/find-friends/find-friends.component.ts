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
  currentFollowers = [];

  constructor(private db: AngularFirestore, public fb: FormBuilder, private afAuth: AngularFireAuth) {
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

  getFriends(dataSearch) {
    this.searcFriendsResuls = [];
    let that = this;
    console.log("Here");
    let valueToCompare = dataSearch.search.toUpperCase();
    console.log(valueToCompare);

    let locationsSubscription = this.db.collection("users").snapshotChanges().map(actions => {
      return actions.map(a => {
        console.log("Am intart in getFriends!");
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        console.log(data.email + " data si id-ul " + id);
        // console.log(a);
        if (id != that.authState.uid) {
          if (data.firstName.toUpperCase().includes(valueToCompare) || data.lastName.toUpperCase().includes(valueToCompare)) {
            return { id, ...data };
          }
        }
        // string.includes(substring);
        console.log("But here?");
      });
    }).subscribe((querySnapshot) => {
      console.log(querySnapshot)
      querySnapshot.forEach((doc) => {
        console.log(doc);
        if (doc) {
          console.log(doc);
          {
            that.searcFriendsResuls.push(doc);
            that.searchResponse = true;
          }
        }

      });

      if (that.searcFriendsResuls.length == 0) {
        that.errorSearchMessageDisplay = true;
        that.searchMessageDisplayed = "No results found!"
      }
      else {
        that.errorSearchMessageDisplay = false;

      }

      that.getTheFollowingPersons();
      locationsSubscription.unsubscribe();

    });
  }

  viewPersonPage(idPerson) {
    console.log(idPerson);
    this.accesPersonPageID = idPerson;
  }


  followAPerson(idPerson) {
    console.log(idPerson);
    console.log(this.authState);

    this.setFollowInDB(idPerson);

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


  getTheFollowingPersons() {

    let that = this;


    const unsubscribe = this.db.collection("users").doc(this.authState.uid).ref
      .onSnapshot(function (doc) {
        console.log(" data: ", doc.data());
        that.currentFollowing = doc.data().following;
        console.log(that.currentFollowing);
        unsubscribe();
      }, function (error) {
        console.log("Error receiving data");
      });

  }

  //Setezi noul Array de following pentru userul logat
  setFollowInDB(idPerson) {

    var that = this;

    that.currentFollowing.push(idPerson);
    let data = {
      following: that.currentFollowing
    }

    const unsubscribe =  that.db.collection("users").doc(that.authState.uid).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document written ok");
        that.setFollowersInIdPersonDB(idPerson);
        that.updateLocalStorage();
      })
      .catch((error) => {
        console.log(error);
      })
  }


  //Setezi noul Array de followers pentru persoana cu id-ul selectat
  setFollowersInIdPersonDB(idPerson){
    var that = this;

    const unsubscribe =  this.db.collection("users").doc(idPerson).ref
      .onSnapshot(function (doc) {
        console.log(" data: ", doc.data());
        that.currentFollowers = doc.data().following;
        console.log(that.currentFollowers);
        unsubscribe();
      }, function (error) {
        console.log("Error receiving data");
    });

    that.currentFollowers.push(that.authState.uid);
    let data = {
      followers: that.currentFollowers
    }

    that.db.collection("users").doc(idPerson).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document written ok");
        that.updateLocalStorage();
      })
      .catch((error) => {
        console.log(error);
      })
  }

  

}
