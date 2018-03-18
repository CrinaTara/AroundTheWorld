import { ElementRef, Component, AfterViewInit, OnInit, ViewChild, NgZone } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth, } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { } from '@types/googlemaps';

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

  messageDisplayed: string = '';
  messageDisplay: boolean = false;
  private updateMessageDisplayed: string = '';
  private updateMessageDisplay: boolean = false;
  private showPictureProfile: boolean = true;
  private showChangePass: boolean = false;
  private showProfileInfo: boolean = false;

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, public fb: FormBuilder, private db: AngularFirestore, private afAuth: AngularFireAuth) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      bio: ['', Validators.required],
      homeBase: ['', Validators.required],
    })

    // this.changePasswordForm = this.fb.group({
    //   newPassword: ['', [Validators.required, , Validators.minLength(6)]],
    //   confirmPassword: ['', Validators.required],
    // })

    this.changePassForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.pattern('^[_a-zA-Z0-9]+(\.[_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$')]]
    }),

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
  }

  saveUserData(dataUser) {
    let data = {
      firstName: dataUser.firstName,
      lastName: dataUser.lastName,
      bio: dataUser.bio,
      homeBase: dataUser.homeBase,
    }
    console.log(this.authState);
    this.db.collection("users").doc(this.authState.uid).set(data, { merge: true })
      .then(function () {
        // console.log("Document written with ID: ", docRef.id);
      
      })
      .catch(function (error) {
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

  url = 'assets/images/user.png';
  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.url = event.target.result;
      }
    }
    console.log(this.url);
  }

  saveUserProfilePicture() {
    console.log("button save picture");
    console.log(this.url);
    let data = {
      profilePicture: this.url
    }
    this.db.collection("users").doc(this.authState.uid).set(data, { merge: true })
      .then(function (docRef) {
      console.log("Document written ok");
      this.updateMessageDisplay = true;
      this.updateMessageDisplayed = "Your information was successfully updated."
      
    })
      .catch(function (error) {
        // console.error("Error adding document: ", error);
        this.updateMessageDisplayed = "There is an error. Try again."
        this.updateMessageDisplay = true;
      });
  }


}
