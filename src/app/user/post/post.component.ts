import { Component, ViewChild, OnInit, AfterViewInit, ElementRef, NgZone, HostListener, forwardRef, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ModalDirective } from 'ngx-bootstrap';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { BsDropdownModule } from 'ngx-bootstrap';
import { MapsAPILoader } from '@agm/core';
// import { } from '@types/googlemaps';
import { } from 'geocoder';

import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

declare var require: any

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';

import { UserProfileComponent } from '../user-profile/user-profile.component';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, AfterViewInit {

  // @ViewChild(forwardRef(() => HomeComponent)) homeComp : HomeComponent;


  tripForm: FormGroup;
  postForm: FormGroup;

  nrPeople = 0;

  lat: number = 0;
  lng: number = 0;
  locationChosen = false;
  aboutLocation = {
    city: '',
    address: '',
    countryLong: '',
    countryShort: '',
    latitude: 0,
    longitude: 0
  };

  citiesInCountry = [];
  items: Observable<any[]>;

  authState: any = null;

  addPhotoDisableButton = false;

  // My list of trips. It will be a  request!
  relatedTrips: any;
  privacyPost: string = 'public';
  public userObject: any;
  public userObjectRetrived: any;

  public showNewTrip: boolean = true;
  public showNewPost: boolean = false;

  public isPrivatePrivacy: boolean = false;

  tripMessageDisplayed: string = '';
  tripMessageDisplay: boolean = false;
  errorTripMessageDisplay: boolean = false;

  postMessageDisplayed: string = '';
  postMessageDisplay: boolean = false;
  errorPostMessageDisplay: boolean = false;

  selectedTrip: any = { name: '', idTRIP: '' };

  private url: any;
  public urlDummy: any;

  urlArray: any = [];
  resizedUrlArray: any = [];

  postData: any;
  object = "privacy";

  @Input() isSelectedPost: any; // we can set the default value also


  constructor(public postModal: BsModalRef, private afAuth: AngularFireAuth,
    public fb: FormBuilder, private db: AngularFirestore,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer,
  ) {

    if (navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.lng = +pos.coords.longitude;
        this.lat = +pos.coords.latitude;
        this.locationChosen = true;
        this.onClickPost();
      });
    }

  }

  ngOnInit() {

    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);
    if (this.userObject.nrTrips != 0) {
      this.showNewPost = true;
      this.showNewTrip = false;
    }

    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth;
      this.getTripsData();

    }),

      this.tripForm = this.fb.group({
        //trip name, trip user, creation date
        tripName: ['', Validators.required],
        tripDetails: ['']
      }),
      this.postForm = this.fb.group({
        //trip id, id user, post id, date
        location: [''],
        city: [''],
        postName: ['', Validators.required],
        postDetails: ['', Validators.required],
        privacy: ['', Validators.required],
        buget: [''],
        otherToughts: ['']
      })

    if (this.isSelectedPost) {
      this.getPostData(this.isSelectedPost);
    }


  }

  ngAfterViewInit() {


  }

  getPostData(idPost) {

    let that = this;

    const unsubscribe = this.db.collection("posts").doc(idPost).ref
      .onSnapshot(function (doc) {

        that.postData = doc.data();
        console.log(" post data: ", that.postData);
        that.patchEditData();
        unsubscribe();
      }, function (error) {
        console.log("Eroor local storage");
      });
  }

  patchEditData() {
    this.postForm.patchValue({
      city: this.postData.aboutLocation.city,
      location: this.postData.aboutLocation.countryLong,
      postName: this.postData.postName,
      postDetails: this.postData.postDetails,
      privacy: this.postData.privacy,
      buget: this.postData.buget,
      otherToughts: this.postData.otherToughts
    });

    this.lng = this.postData.aboutLocation.longitude;
    this.lat = this.postData.aboutLocation.latitude;
    this.locationChosen = true;

    this.setPrivacy(this.postData.privacy);
    // this.chooseATrip(this.postData.idTrip);
    this.selectedTrip.idTRIP = this.postData.idTrip;
    this.selectedTrip.name = this.postData.tripName;

    if (this.postData.photos.length != 0) {
      this.urlArray = this.postData.photos;
      this.resizedUrlArray = this.postData.photos;
    } else {
      this.urlArray = [];
      this.resizedUrlArray = [];
    }


    this.object = this.postData.privacy;

    this.aboutLocation = {
      city: this.postData.aboutLocation.city,
      address: this.postData.aboutLocation.address,
      countryLong: this.postData.aboutLocation.countryLong,
      countryShort: this.postData.aboutLocation.countryShort,
      latitude: this.postData.aboutLocation.latitude,
      longitude: this.postData.aboutLocation.longitude

    }


  }

  updatePost() {
    if (this.selectedTrip.name === '' || this.selectedTrip.idTRIP === '') {
      this.postMessageDisplayed = 'Please select a related Trip for this post.';
      this.errorPostMessageDisplay = true;
    }
    else if (this.postForm.value.postName === '' || this.postForm.value.postDetails === '') {
      this.postMessageDisplayed = 'Please complete the required fields. ';
      this.errorPostMessageDisplay = true;
    }
    else {

      var that = this;
      let now = moment();

      this.aboutLocation.city = this.postForm.value.city;


      let data = {
        postName: this.postForm.value.postName,
        tripName: this.selectedTrip.name,
        idTrip: this.selectedTrip.idTRIP,
        idUser: this.authState.uid,
        creationDate: now.format('L'),
        creationHour: now.format('LT'),
        postDetails: this.postForm.value.postDetails,
        privacy: this.privacyPost,
        buget: this.postForm.value.buget,
        otherToughts: this.postForm.value.otherToughts,
        likedByUsers: [],

        aboutLocation: this.aboutLocation,
        photos: this.resizedUrlArray
      }

      const unsubscribe = that.db.collection("posts").doc(that.isSelectedPost).set(data, { merge: true })
        .then(function (docRef) {
          that.clearPostData();
          that.postMessageDisplayed = 'Posted succesfully!';
          that.postMessageDisplay = true;
          that.errorPostMessageDisplay = false;
          that.countPosts();
          console.log("De la user:");
          // that.user.getMyPosts();
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
          that.postMessageDisplayed = 'Something went wrong. Try again!';
          that.errorPostMessageDisplay = true;
          that.clearPostData();
        });
    }
  }

  setPrivacy(choose) {
    console.log(choose);
    this.privacyPost = choose;
    if (choose == "public") {
      this.isPrivatePrivacy = false;
      this.postForm.patchValue({
        buget: '',
        otherToughts: ''
      });
    } else if (choose == "private") {
      this.isPrivatePrivacy = true;
    }
    else {
      this.isPrivatePrivacy = false;
    }
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

  updateUserProfile() {
    var that = this;
    let numbr = 0;
    const unsubscribe = this.db.collection("trips").ref.where("idUser", "==", this.authState.uid)
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          numbr += 1;
        })
        console.log(numbr);
        unsubscribe();
        let data = {
          nrTrips: numbr
        }
        console.log("NUMERB OF: " + data.nrTrips);
        let th = that;
        that.db.collection("users").doc(that.authState.uid).set(data, { merge: true })
          .then(function () {
            th.updateLocalStorage();
          })
          .catch((error) => {
            console.error("Error adding document: ", error);
          });
      });

  }

  //Create TRIP!
  createTrip() {

    if (this.tripForm.value.tripName === '') {
      this.tripMessageDisplayed = 'Please complete the required field.';
      this.errorTripMessageDisplay = true;
    }
    else {
      var that = this;
      let now = moment();
      this.db.collection("trips").add({
        tripName: this.tripForm.value.tripName,
        tripDetails: this.tripForm.value.tripDetails,
        idUser: this.authState.uid,
        creationDate: now.format('L'),
        endDate: ''
      })
        .then(function (docRef) {
          console.log("Document successfully written!");
          that.getTripsData();
          that.clearTripData();
          that.updateUserProfile();
          that.showNewPost = true;
          that.showNewTrip = false;
          that.errorTripMessageDisplay = false;
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
          that.tripMessageDisplayed = 'Something went wrong. Try again!';
          that.errorTripMessageDisplay = true;
          that.clearTripData();
        });

    }

  }

  clearPostData() {
    this.postForm.patchValue({
      city: '',
      location: '',
      postName: '',
      postDetails: '',
      privacy: '',
      buget: '',
      otherToughts: ''
    });

    // this.user.getMyPosts();
    this.urlArray = [];
    this.resizedUrlArray = [];
    this.privacyPost = 'public';
    this.isPrivatePrivacy = false;
  }

  clearTripData() {
    this.tripForm.patchValue({
      tripName: '',
      tripDetails: ''
    });
  }


  //Create POST!
  createPost() {

    if (this.selectedTrip.name === '') {
      this.postMessageDisplayed = 'Please select a related Trip for this post.';
      this.errorPostMessageDisplay = true;
    }
    else if (this.postForm.value.postName === '' || this.postForm.value.postDetails === '') {
      this.postMessageDisplayed = 'Please complete the required fields. ';
      this.errorPostMessageDisplay = true;
    }
    else {

      var that = this;
      let now = moment();

      this.aboutLocation.city = this.postForm.value.city;
      console.log("Valorile inainte sa le introduc: ");
      console.log(this.aboutLocation);

      this.db.collection("posts").add({
        postName: this.postForm.value.postName,
        tripName: this.selectedTrip.name,
        idTrip: this.selectedTrip.idTRIP,
        idUser: this.authState.uid,
        creationDate: now.format('L'),
        creationHour: now.format('LT'),
        postDetails: this.postForm.value.postDetails,
        privacy: this.privacyPost,
        buget: this.postForm.value.buget,
        otherToughts: this.postForm.value.otherToughts,
        likedByUsers: [],
        aboutLocation: this.aboutLocation,
        photos: this.resizedUrlArray

      })
        .then(function (docRef) {
          that.clearPostData();
          that.postMessageDisplayed = 'Posted succesfully!';
          that.postMessageDisplay = true;
          that.errorPostMessageDisplay = false;
          that.countPosts();
          that.updateTripDate(now.format('L'));
          console.log("De la user:");
          // that.user.getMyPosts();
          // that.homeComp.getAllPlaces();
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
          that.postMessageDisplayed = 'Something went wrong. Try again!';
          that.postMessageDisplay = false;
          that.errorPostMessageDisplay = true;
          that.clearPostData();
        });
    }

  }

  countPosts() {
    let that = this;
    console.log("Count post!");

    const locationsSubscription = this.db.collection("posts").snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        console.log(data.aboutLocation);
        console.log(that.aboutLocation);
        if (data.aboutLocation.countryLong === that.aboutLocation.countryLong) {
          return { id };
        }
        // string.includes(substring);
      });
    }).subscribe((querySnapshot) => {
      // console.log(querySnapshot)
      querySnapshot.forEach((doc) => {
        if (doc) {
          that.nrPeople = that.nrPeople + 1;
        }
      });
      console.log(that.nrPeople);
      that.getCountryData();

      locationsSubscription.unsubscribe();
    });


  }


  getCountryData() {
    let that = this;

    const unsubscribe = this.db.collection("countries").doc(this.aboutLocation.countryShort).ref.onSnapshot(function (doc) {
      if (doc.exists) {
        console.log(" data: ", doc.data());
        that.citiesInCountry = doc.data().citiesInCountry;
        console.log(that.citiesInCountry);
        that.citiesInCountry.push(that.aboutLocation.city);
        that.addCountryToDatabase();
        unsubscribe();

      } else {
        console.log("No such document!");
        that.citiesInCountry.push(that.aboutLocation.city);
        that.addCountryToDatabase();
        unsubscribe();
      }
    }, function (error) {
      console.log("Error receiving data");
    });

  }


  addCountryToDatabase() {
    console.log("Country to database!");
    let that = this;
    let data = {
      short: this.aboutLocation.countryShort,
      long: this.aboutLocation.countryLong,
      nrPeople: this.nrPeople,
      citiesInCountry: this.citiesInCountry,

    };
    console.log(data);

    this.db.collection("countries").doc(this.aboutLocation.countryShort).set(data, { merge: true })
      .then(function () {
        that.nrPeople = 0;
        that.citiesInCountry = [];
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });


  }

  updateTripDate(date) {

    let data = {
      endDate: date
    };
    this.db.collection("trips").doc(this.selectedTrip.idTRIP).set(data, { merge: true })
      .then(function () {
        console.log("Data Adaugata");
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  }

  getTripsData() {

    console.log('Here is uuid');
    console.log(this.authState.uid);

    //This code is working! Down below!!
    // this.db.collection("posts").ref.where("idUser", "==", this.authState.uid).orderBy("creationDate", "desc").orderBy("creationHour", "desc").limit(3)
    // .onSnapshot(function(querySnapshot) {
    //     querySnapshot.forEach(function(doc) {
    //       console.log(doc.id, " => ", doc.data());
    //     })
    //   });

    var arr = [];
    var that = this;
    this.db.collection('trips').ref.orderBy("creationDate", "desc").limit(11).get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          arr.push({
            name: doc.data().tripName,
            IDUSER: doc.data().idUser,
            idTRIP: doc.id,
            crDate: doc.data().creationDate
          })

        });


        that.relatedTrips = arr.filter(function (trip) {
          return trip.IDUSER == that.authState.uid;
        })

        console.log("AICI:");
        console.log(that.relatedTrips);
      })
      .catch(function (error) {
        console.log("Error getting documents: ", error);
      });


  }

  chooseATrip(choise) {
    console.log("This is the trip i choose");
    console.log(choise);
    this.selectedTrip = choise;
  }

  newTrip() {
    this.showNewPost = false;
    this.showNewTrip = true;
  }

  //For the reverse Geocoder
  geocoder = require('geocoder');

  onChoseLocation(event) {

    console.log(event);
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.locationChosen = true;

    let that = this;

    this.geocoder.reverseGeocode(this.lat, this.lng, function (err, data) {
      // do something with data
      console.log(data);
      if (data.status === 'OK') {

        if (data.results[0]) {
          that.postForm.patchValue({
            location: data.results[0].formatted_address
          })


          // console.log(data.results[0].formatted_address);
          // let city = data.results[0].address_components[data.results[0].address_components.length-2].short_name;
          // // let country = data.results[data.results.length - 1].formatted_address;
          // console.log(city);
          // // address_components[2].short_name



          //Varianta mai buna din punct de vedere al rezultatului
          for (let i = 0; i < data.results.length; i++) {
            if (data.results[i].types[0] === "country") {

              let country_short = data.results[i].address_components[0].short_name;
              let country_long = data.results[i].address_components[0].long_name;
              that.aboutLocation = {
                city: '',
                address: data.results[0].formatted_address,
                countryLong: country_long,
                countryShort: country_short,
                latitude: that.lat,
                longitude: that.lng

              }
            }

            if (data.results[i].types[0] === "locality") {
              let city = data.results[i].address_components[0].long_name;
              that.postForm.patchValue({
                city: city
              })

              that.aboutLocation.city = city;

            }

          }
          console.log(that.aboutLocation);
        }
      }
    }, { sensor: true });
  }


  onClickPost() {
    let that = this;

    this.geocoder.reverseGeocode(this.lat, this.lng, function (err, data) {
      // do something with data
      console.log(data);
      if (data.status === 'OK') {

        if (data.results[0]) {
          that.postForm.patchValue({
            location: data.results[0].formatted_address
          })


          for (let i = 0; i < data.results.length; i++) {
            if (data.results[i].types[0] === "country") {

              let country_short = data.results[i].address_components[0].short_name;
              let country_long = data.results[i].address_components[0].long_name;
              that.aboutLocation = {
                city: '',
                address: data.results[0].formatted_address,
                countryLong: country_long,
                countryShort: country_short,
                latitude: that.lat,
                longitude: that.lng

              }
            }

            if (data.results[i].types[0] === "locality") {
              let city = data.results[i].address_components[0].long_name;
              that.postForm.patchValue({
                city: city
              })

              that.aboutLocation.city = city;

            }

          }
          console.log(that.aboutLocation);
        }
      }
    }, { sensor: true });
  }


  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.urlDummy = event.target.result;
        this.urlArray.push(this.urlDummy);
        if (this.urlArray.length >= 4) this.addPhotoDisableButton = true;
        console.log(this.urlArray.length > 4);
      }
      this.resizeAuthomatical(event);
    }

    // console.log(this.url);
  }

  removePhoto(index) {
    this.urlArray.splice(index, 1);
    this.resizedUrlArray.splice(index, 1);
    if (this.urlArray.length < 4) this.addPhotoDisableButton = false;
  }

  resizeAuthomatical(event) {
    var file = event.target.files[0];
    console.log(file);
    // Create a file reader
    var reader = new FileReader();
    // reader.readAsDataURL(event.target.files[0]); // read file as data url
    // reader.readAsDataURL(file);

    reader.onload = (event: any) => { // called once readAsDataURL is completed
      // this.url = event.target.result;
      var img = new Image();
      img.src = event.target.result;
      console.log(img);
      if (img.complete) {
        this.draw(img, file);
      } else {
        img.onload = () => { this.draw(img, file); };
      }


    }
    reader.readAsDataURL(file);
  }

  draw(img, file) {
    var canvas = document.createElement('canvas');
    //var canvas = $("<canvas>", {"id":"testing"})[0];
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    console.log(canvas);
    console.log(ctx);
    var MAX_WIDTH = 400;
    var MAX_HEIGHT = 400;
    var width = img.width;
    var height = img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    console.log(canvas);
    canvas.width = width;
    canvas.height = height;
    console.log(canvas);
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    console.log("AIICICIIDIIDIDI");

    var dataurl = canvas.toDataURL(file.type);
    console.log(dataurl);
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(dataurl);

    this.resizedUrlArray.push(this.url.changingThisBreaksApplicationSecurity);
    if (this.resizedUrlArray.length >= 4) this.addPhotoDisableButton = true;
  }

}
