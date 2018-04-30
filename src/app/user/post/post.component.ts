import { Component, ViewChild, OnInit, AfterViewInit, ElementRef, NgZone } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ModalDirective } from 'ngx-bootstrap';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { BsDropdownModule } from 'ngx-bootstrap';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, AfterViewInit {
  tripForm: FormGroup;
  postForm: FormGroup;

  // public searchControl: FormControl;
  // @ViewChild("search")
  // public searchElementRef: ElementRef;

  authState: any = null;

  // My list of trips. It will be a  request!
  relatedTrips: string[] = [
    'The first choice!',
    'And another choice for you.',
    'but wait! A third!'
  ];

  public userObject: any;
  public userObjectRetrived: any;

  public showNewTrip: boolean = true;
  public showNewPost: boolean = false;

  tripMessageDisplayed: string = '';
  tripMessageDisplay: boolean = false;

  constructor(public postModal: BsModalRef, private afAuth: AngularFireAuth, 
              public fb: FormBuilder, private db: AngularFirestore,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone
            ) {
  }

  ngOnInit() {

    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);
    if(this.userObject.nrTrips !=0){
      this.showNewPost = true;
      this.showNewTrip = false;
    }

    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth;
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

  setPrivacy(choose){
    console.log(choose);
  }

  updateLocalStorage(){
    this.db.collection("users").doc(this.authState.uid).ref
    .onSnapshot(function (doc) {
      // var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      console.log(" data: ", doc.data());
      localStorage.setItem('User', JSON.stringify(doc.data()));
    }, function (error) {
      console.log("Eroor local storage");
    });
  }

  updateUserProfile(){
    let data = {
      nrTrips: 1
    }
    console.log(this.authState);
    var that = this;
    this.db.collection("users").doc(this.authState.uid).set(data, { merge: true })
      .then(function () {
        that.updateLocalStorage();
      })
      .catch( (error) => {
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

  clearTripData(){
    this.tripForm.patchValue({
      location:'',
      postName: '',
      postDetails: '',
      privacy: ''
    });
  }

  clearPostData(){
    this.postForm.patchValue({
      tripName: '',
      tripDetails: ''
    });
  }

  createPost(){
    console.log('Create post!');
  }

  // Does't work. Maybe with valuesChanged.
  getTripsData(){
    // !!!!!!!!!!Get id trips
    console.log('Here is uuid');
    console.log(this.authState.uid);
    this.db.collection("trips", ref => ref.where('tripName', '==', 'b'))
    .ref.get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
        });
      })
      .catch(function (error) {
        console.log("Error getting documents: ", error);
      });
  }

  newTrip() {
    this.showNewPost = false;
    this.showNewTrip = true;
  }
}
