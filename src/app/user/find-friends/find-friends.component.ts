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

  searchResponse: boolean = false;
  searcFriendsResuls = [];

  searchFriendsForm: FormGroup;

  searchMessageDisplayed: string = '';
  errorSearchMessageDisplay: boolean = false;

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
    this.db.collection("users").snapshotChanges().map(actions => {
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
          that.searcFriendsResuls.push(doc);
          that.searchResponse = true;
        }
      
      });

      if(that.searcFriendsResuls.length == 0) {
        that.errorSearchMessageDisplay = true;
        that.searchMessageDisplayed = "No results found!"
      }
      else  that.errorSearchMessageDisplay = false;


    });
  }

}
