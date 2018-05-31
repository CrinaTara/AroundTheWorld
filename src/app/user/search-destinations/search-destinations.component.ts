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
    })
  }

  



  getPlaces(dataSearch){
    console.log("asdasda");
    this.searchPlaces= [];
    let that = this;
    let valueToCompare = dataSearch.search.toUpperCase();
    console.log(valueToCompare);
    this.db.collection("countries").snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data()
        console.log(data);
        const id = a.payload.doc.id;
          if (data.long.toUpperCase().includes(valueToCompare)) {
            return { id, ...data };
          }
        // string.includes(substring);
      });
    }).subscribe((querySnapshot) => {
      // console.log(querySnapshot)
      querySnapshot.forEach((doc) => {
        console.log("Here");
        if (doc) {
          console.log(doc);
          that.searchPlaces.push(doc);

        }
      
      });


      if(that.searchPlaces.length == 0) {
        that.errorSearchMessageDisplay = true;
        that.searchMessageDisplayed = "No results found!"
      }
      else  that.errorSearchMessageDisplay = false;


    });

    // locationsSubscription.unsubscribe();

    
  }


}
