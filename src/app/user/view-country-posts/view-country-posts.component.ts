import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";

@Component({
  selector: 'app-view-country-posts',
  templateUrl: './view-country-posts.component.html',
  styleUrls: ['./view-country-posts.component.scss']
})
export class ViewCountryPostsComponent implements OnInit {

  authState: any = null;

  public params: any;
  public searchedItem: any;
  weHavePosts: boolean = false;
  noResult = false;

  postsILiked = [];
  dublicate = [];

  private chart: AmChart;

  countryData: any;
  countryListPosts = [];
  citySearchName: any;

  searchCityForm: FormGroup;
  monthsPeopleArr: any;

  constructor(private route: ActivatedRoute, private router: Router,
    private db: AngularFirestore, public fb: FormBuilder,
    private afAuth: AngularFireAuth, private AmCharts: AmChartsService,
  ) {
    this.params = this.route.params;
    this.searchedItem = this.params._value.name;

    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {
    this.searchCityForm = this.fb.group({
      search: ['', Validators.required],
    });
    this.postsILiked = [];
    this.dublicate = [];
    this.countryData = [];
    this.getCountryData();
    this.getCountryPosts();
    this.showChart();
  }

  getCountryData() {
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

  getCountryPosts() {
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("aboutLocation.countryShort", "==", this.searchedItem).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());

          that.countryListPosts.push({ id: doc.id, ...doc.data() });

          that.postsILiked = doc.data().likedByUsers;
          that.dublicate = doc.data().likedByUsers;

          that.weHavePosts = true;
          unsubscribe();
        })
        console.log(that.countryListPosts);

      });
  }

  getLikedPosts() {
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("aboutLocation.countryShort", "==", this.searchedItem).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {

          that.postsILiked = doc.data().likedByUsers;
          that.dublicate = doc.data().likedByUsers;

          unsubscribe();
        })
        console.log(that.countryListPosts);
      });
  }


  searchCity(data) {
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


  likeAPost(idPost) {
    console.log(idPost);
    console.log(this.postsILiked);
    this.postsILiked.push(this.authState.uid);

    let data = {
      likedByUsers: this.postsILiked
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


  dislikeAPost(idPost) {

    const index2: number = this.postsILiked.indexOf(this.authState.uid);
    if (index2 !== -1) {
      this.postsILiked.splice(index2, 1);
    }

    let data = {
      likedByUsers: this.postsILiked
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

  showChart() {
    const that = this;

    this.chart = this.AmCharts.makeChart("chartdiv", {
      "type": "pie",
      "theme": "light",
      "dataProvider": [{
        "country": "Lithuania",
        "litres": 501.9
      }, {
        "country": "Czech Republic",
        "litres": 301.9
      }, {
        "country": "Ireland",
        "litres": 201.1
      }, {
        "country": "Germany",
        "litres": 165.8
      }, {
        "country": "Australia",
        "litres": 139.9
      }, {
        "country": "Austria",
        "litres": 128.3
      }, {
        "country": "UK",
        "litres": 99
      }, {
        "country": "Belgium",
        "litres": 60
      }, {
        "country": "The Netherlands",
        "litres": 50
      }],
      "valueField": "litres",
      "titleField": "country",
      "balloon": {
        "fixedPosition": true
      },
      "export": {
        "enabled": true
      }
    });

  }


}
