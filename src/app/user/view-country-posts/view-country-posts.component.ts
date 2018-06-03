import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-country-posts',
  templateUrl: './view-country-posts.component.html',
  styleUrls: ['./view-country-posts.component.scss']
})
export class ViewCountryPostsComponent implements OnInit {

  public params: any;
  public searchedItem: any;
  weHavePosts : boolean = false;
  noResult = false;

  countryData: any;
  countryListPosts = [];
  citySearchName: any;

  searchCityForm: FormGroup;

  constructor(private route: ActivatedRoute, private router: Router,
              private db: AngularFirestore,  public fb: FormBuilder
            ) { 
    this.params = this.route.params;
    this.searchedItem = this.params._value.name;
  }

  ngOnInit() {
    this.searchCityForm = this.fb.group({
      search: ['', Validators.required],
    })
    this.getCountryData();
    this.getCountryPosts();
  }

  getCountryData(){
    let that = this;
    console.log("Get country data")
    this.db.collection("countries").doc(this.searchedItem).ref.get().then(function (doc) {
      if (doc.exists) {
        console.log("Country data:", doc.data());
        that.countryData = doc.data();
        
      } else {
        console.log("No such document!");
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });
  }

  typeaheadNoResults(event: boolean): void {
    this.noResult = event;
  }

  getCountryPosts(){
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("aboutLocation.countryShort", "==", this.searchedItem).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());

          that.countryListPosts.push(doc.data());
          that.weHavePosts = true;
          unsubscribe();
        })
        console.log(that.countryListPosts);

      });
  }

  searchCity(data){
    console.log(data);
    this.countryListPosts = [];
    this.citySearchName = data.search;
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("aboutLocation.city", "==", data.search).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());

          that.countryListPosts.push(doc.data());
          that.weHavePosts = true;
          unsubscribe();
        })
        console.log(that.countryListPosts);

      });
  }

}
