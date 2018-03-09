import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth, } from 'angularfire2/auth';
import * as firebase from 'firebase';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  userForm: FormGroup;
  // changePasswordForm: FormGroup;
  changePassForm: FormGroup;

  messageDisplayed: string = '';
  messageDisplay: boolean = false;
  private showPictureProfile: boolean = true;
  private showChangePass: boolean = false;
  private showProfileInfo: boolean = false;
  
  constructor(public fb: FormBuilder, private db: AngularFirestore, private afAuth: AngularFireAuth) {
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
    })

   }

  ngOnInit() {
    
  }

  saveUserData(dataUser){
    console.log(dataUser);
    this.db.collection("users").add({
      firstName: dataUser.firstName,
      lastName: dataUser.lastName,
      bio: dataUser.bio, 
      homeBase: dataUser.homeBase,
  })
  .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
      this.userForm.patchValue({
        firstName: '',
        lastName: '',
        bio: '',
        homeBase: ''
      });
  });
  }

  updatePassword(data){
       var auth = firebase.auth();
       let email =  data.newEmail;
      return auth.sendPasswordResetEmail(email)
       .then(() =>{
        this.messageDisplay = true;
        this.messageDisplayed = 'Mail successfully sent! Please check your email.';
      })
       .catch((error) =>{ 
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
  
 toInfoProfile(){
    this.showPictureProfile = false;
    this.showProfileInfo = true;
  }
  backPictureProfile(){
    this.showProfileInfo = false;
    this.showPictureProfile = true;
  }
  toChangePass(){
    this.showChangePass = true;
    this.showProfileInfo = false;
  }
  backProfileInfo(){
    this.showProfileInfo = true;
    this.showChangePass = false;
  }

}
