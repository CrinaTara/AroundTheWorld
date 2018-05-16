import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFirestore } from 'angularfire2/firestore';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';


@Component({
  selector: 'app-search-destinations',
  templateUrl: './search-destinations.component.html',
  styleUrls: ['./search-destinations.component.scss']
})
export class SearchDestinationsComponent implements OnInit {


  searchPlaces = [];

  authState: any = null;

  searchPlaceForm: FormGroup;

  searchMessageDisplayed: string = '';
  errorSearchMessageDisplay: boolean = false;

  constructor(private db: AngularFirestore,  public fb: FormBuilder, private afAuth: AngularFireAuth) { 
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {
    this.searchPlaceForm = this.fb.group({
      search: ['', Validators.required],
    }),

    this.getInitPlaces();
  }

  getInitPlaces(){

  }


  getPlaces(dataSearch){
    this.searchPlaces= [];
    let that = this;
    let valueToCompare = dataSearch.search.toUpperCase();
    this.db.collection("posts").snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
          if (data.aboutLocation.countryLong.toUpperCase().includes(valueToCompare)) {
            return { id, ...data };
          }
        // string.includes(substring);
      });
    }).subscribe((querySnapshot) => {
      // console.log(querySnapshot)
      querySnapshot.forEach((doc) => {
        
        if (doc) {
          console.log(doc);
          that.searchPlaces.push(doc);

        }
      
      });

      let fruits_without_duplicates =  Array.from(new Set( that.searchPlaces ));
      console.log(fruits_without_duplicates);

      if(that.searchPlaces.length == 0) {
        that.errorSearchMessageDisplay = true;
        that.searchMessageDisplayed = "No results found!"
      }
      else  that.errorSearchMessageDisplay = false;


    });
  }


}