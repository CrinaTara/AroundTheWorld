import { Component, ViewChild, OnInit, AfterViewInit, ElementRef, NgZone, HostListener } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ModalDirective } from 'ngx-bootstrap';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { BsDropdownModule } from 'ngx-bootstrap';
import { MapsAPILoader } from '@agm/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, AfterViewInit {
  tripForm: FormGroup;
  postForm: FormGroup;

  items: Observable<any[]>;

  // public searchControl: FormControl;
  // @ViewChild("search")
  // public searchElementRef: ElementRef;

  authState: any = null;

  // My list of trips. It will be a  request!
  relatedTrips: any;
  public userObject: any;
  public userObjectRetrived: any;

  public showNewTrip: boolean = true;
  public showNewPost: boolean = false;

  public isPrivatePrivacy: boolean = false;

  tripMessageDisplayed: string = '';
  tripMessageDisplay: boolean = false;

  postMessageDisplayed: string = '';
  postMessageDisplay: boolean = false;


  constructor(public postModal: BsModalRef, private afAuth: AngularFireAuth,
    public fb: FormBuilder, private db: AngularFirestore,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {
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
        location: ['', Validators.required],
        postName: ['', Validators.required],
        postDetails: ['', Validators.required],
        privacy: ['', Validators.required]
      })

    // this.mapsAPILoader.load().then(() => {
    //   let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
    //     types: ["address"]
    //   });
    //   autocomplete.addListener("place_changed", () => {
    //     this.ngZone.run(() => {
    //       //get the place result
    //       let place: google.maps.places.PlaceResult = autocomplete.getPlace();


    //       //verify result
    //       if (place.geometry === undefined || place.geometry === null) {
    //         return;
    //       }

    //     });
    //   });
    // });

  }

  ngAfterViewInit() {


  }

  setPrivacy(choose) {
    console.log(choose);
    if (choose == "public") {
      this.isPrivatePrivacy = false;
    } else if (choose == "private") {
      this.isPrivatePrivacy = true;
    }
    else {
      this.isPrivatePrivacy = false;
    }
  }

  updateLocalStorage() {
    this.db.collection("users").doc(this.authState.uid).ref
      .onSnapshot(function (doc) {
        // var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(" data: ", doc.data());
        localStorage.setItem('User', JSON.stringify(doc.data()));
      }, function (error) {
        console.log("Eroor local storage");
      });
  }

  updateUserProfile() {
    let data = {
      nrTrips: 1
    }
    console.log(this.authState);
    var that = this;
    this.db.collection("users").doc(this.authState.uid).set(data, { merge: true })
      .then(function () {
        that.updateLocalStorage();
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  }

  createTrip() {
    var that = this;
    let now = moment();
    this.db.collection("trips").add({
      tripName: this.tripForm.value.tripName,
      tripDetails: this.tripForm.value.tripDetails,
      idUser: this.authState.uid,
      creationDate: now.format('L'),
    })
      .then(function (docRef) {
        console.log("Document successfully written!");
        that.getTripsData();
        that.clearTripData();
        that.updateUserProfile();
        that.showNewPost = true;
        that.showNewTrip = false;
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
        this.tripMessageDisplayed = 'Something went wrong. Try again!';
        this.tripMessageDisplay = true;
        that.clearTripData();
      });


  }

  clearPostData() {
    this.postForm.patchValue({
      location: '',
      postName: '',
      postDetails: '',
      privacy: ''
    });
  }

  clearTripData() {
    this.tripForm.patchValue({
      tripName: '',
      tripDetails: ''
    });
  }

  createPost() {
    console.log('Create post!');
    // var that = this;
    // let now = moment();
    // this.db.collection("posts").add({
    // location: this.postForm.value.location,
    // postName: this.tripForm.value.postName,
    // idUser: this.authState.uid,
    // creationDate: now.format('L'),
    // postDetails:
    // })
    //   .then(function (docRef) {
    //     console.log("Document successfully written!");

    //   })
    //   .catch(function (error) {
    //     console.error("Error adding document: ", error);
    //     this.postMessageDisplayed = 'Something went wrong. Try again!';
    //     this.postMessageDisplay = true;
    //     that.clearPostData();
    //   });
  }

  // Does't work. Maybe with valuesChanged.
  getTripsData() {
    // !!!!!!!!!!Get id trips
    console.log('Here is uuid');
    console.log(this.authState.uid);

    // this.db.collection('trips', ref => ref.where('idUser', '==', this.authState.uid) )
    // .ref.get()
    //   .then(function (querySnapshot) {
    //     querySnapshot.forEach(function (doc) {
    //       // doc.data() is never undefined for query doc snapshots
    //       console.log(doc.id, " => ", doc.data());
    //     });
    //   })
    //   .catch(function (error) {
    //     console.log("Error getting documents: ", error);
    //   });

    var arr = [];
    var that = this;
    this.db.collection('trips').ref.get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, " => ", doc.data().tripName);
          arr.push({
            name: doc.data().tripName,
            IDUSER: doc.data().idUser,
            idTRIP: doc.id
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

    // this.relatedTrips = this.items = this.db.collection('trips', ref => ref.where('idUser', '==', this.authState.uid)).valueChanges();

  }

  chooseATrip(choise) {
    console.log("This is the trip i choose");
    console.log(choise);
  }

  newTrip() {
    this.showNewPost = false;
    this.showNewTrip = true;
  }
}