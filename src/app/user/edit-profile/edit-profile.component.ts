import { ElementRef, Component, AfterViewInit, OnInit, ViewChild, NgZone } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth, } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { } from '@types/googlemaps';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, AfterViewInit {

  @ViewChild("search", { read: ElementRef }) private search: ElementRef;

  userForm: FormGroup;
  // changePasswordForm: FormGroup;
  changePassForm: FormGroup;
  authState: any = null;

  public userObject: any;
  public userObjectRetrived: any;
  private url: any;
  public urlDummy: any;

  messageDisplayed: string = '';
  messageDisplay: boolean = false;
  private updateMessageDisplayed: string = '';
  private updateMessageDisplay: boolean = false;
  private showPictureProfile: boolean = true;
  private showChangePass: boolean = false;
  private showProfileInfo: boolean = false;

  constructor(private sanitizer: DomSanitizer,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private db: AngularFirestore,
    private afAuth: AngularFireAuth) {

    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });

  }

  ngAfterViewInit() {
    this.mapsAPILoader.load().then(
      () => {
        let autocomplete = new google.maps.places.Autocomplete(this.search.nativeElement.value, { types: ["address"] });
        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            let place: google.maps.places.PlaceResult = autocomplete.getPlace();
            //verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }
          });
        })
      }
    );

  }

  ngOnInit() {
    console.log(this.authState);


    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);

    this.url = (this.userObject.profilePicture == '') ? 'assets/images/user.png' : this.userObject.profilePicture;

    this.userForm = this.fb.group({
      firstName: [this.userObject.firstName, Validators.required],
      lastName: [this.userObject.lastName, Validators.required],
      bio: [this.userObject.bio, Validators.required],
      homeBase: [this.userObject.homeBase, Validators.required],
    })

    // this.changePasswordForm = this.fb.group({
    //   newPassword: ['', [Validators.required, , Validators.minLength(6)]],
    //   confirmPassword: ['', Validators.required],
    // })

    this.changePassForm = this.fb.group({
      newEmail: [this.userObject.email, [Validators.required, Validators.pattern('^[_a-zA-Z0-9]+(\.[_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$')]]
    })
  }

  updateLocalStorage(){
    this.db.collection("users").doc(this.authState.uid).ref
    .onSnapshot(function (doc) {
      // var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      console.log(" data: ", doc.data());
      localStorage.setItem('User', JSON.stringify(doc.data()));
    }, function (error) {
      console.log("Eroor");
    });
  }

  saveUserData(dataUser) {
    let data = {
      firstName: dataUser.firstName,
      lastName: dataUser.lastName,
      bio: dataUser.bio,
      homeBase: dataUser.homeBase,
    }
    console.log(this.authState);
    var that = this;
    this.db.collection("users").doc(this.authState.uid).set(data, { merge: true })
      .then(function () {
        // console.log("Document written with ID: ", docRef.id);
        //???????
        that.updateLocalStorage();
      })
      .catch( (error) => {
        console.error("Error adding document: ", error);
        this.userForm.patchValue({
          firstName: '',
          lastName: '',
          bio: '',
          homeBase: ''
        });
      });

  }


  updatePassword(data) {
    var auth = firebase.auth();
    let email = data.newEmail;
    return auth.sendPasswordResetEmail(email)
      .then(() => {
        this.messageDisplay = true;
        this.messageDisplayed = 'Mail successfully sent! Please check your email.';
      })
      .catch((error) => {
        console.log(error);
      })
  }

  // updatePassword(userDetails) {

  //   var newPassword = this.changePasswordForm.value.newPassword;
  //   var confirmPassword = this.changePasswordForm.value.confirmPassword;
  //   if ((newPassword == '' || confirmPassword == '')) {
  //     this.messageDisplay = true;
  //     this.messageDisplayed = "All fields are required!";
  //     setTimeout(() => {
  //       this.messageDisplay = false;
  //       this.messageDisplayed = '';
  //     }, 2500);
  //   }
  //   else {
  //     if (newPassword == confirmPassword) {
  //       // cod

  //     } else {
  //       // this.ChangePassword.hide();
  //       this.messageDisplay = true;
  //       this.messageDisplayed = "Password mismatch!";
  //       this.changePasswordForm.patchValue({
  //         newPassword: '',
  //         confirmPassword: '',
  //       });
  //       setTimeout(() => {
  //         this.messageDisplay = false;
  //         this.messageDisplayed = '';
  //       }, 2500);
  //     }
  //   }
  // }

  //Transaction between profile settings
  toInfoProfile() {
    this.showPictureProfile = false;
    this.showProfileInfo = true;

  }
  backPictureProfile() {
    this.showProfileInfo = false;
    this.showPictureProfile = true;

  }
  toChangePass() {
    this.showChangePass = true;
    this.showProfileInfo = false;

  }
  backProfileInfo() {
    this.showProfileInfo = true;
    this.showChangePass = false;

  }

  // url = 'assets/images/user.png';
  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.urlDummy = event.target.result;
      }
      this.resizeAuthomatical(event);
    }

    // console.log(this.url);
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
    }
    reader.readAsDataURL(file);
  }

  saveUserProfilePicture() {
    console.log("button save picture");
    console.log(this.url);
    let data = {
      profilePicture: this.url.changingThisBreaksApplicationSecurity
    }
    var that = this;
    this.db.collection("users").doc(this.authState.uid).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document written ok");
        // this.updateMessageDisplay = true;
        // this.updateMessageDisplayed = "Your information was successfully updated."
        that.updateLocalStorage();

      })
      .catch((error) => {
        console.log(error);
      })
  }

}
