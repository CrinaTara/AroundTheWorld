import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth, } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { Router } from "@angular/router";
import * as firebase from 'firebase';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  userForm: FormGroup;
  resetPasswordForm: FormGroup;
  authState: any = null;

  showMessage: boolean = false;
  errorPassword : any = false;
  errorServer: boolean = false;
  errorMessage: string;
  invalidEmail: boolean = false;
  lostPassword: boolean =  false;

  constructor(public fb: FormBuilder, private afAuth: AngularFireAuth, private router:Router, private db: AngularFirestore) { 
    this.userForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
    this.resetPasswordForm = this.fb.group({
      email: ['', Validators.required]
    })
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {
  }


  validateEmail(email: any) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  emailLogin(data) {
    var valid = true;

    if (this.userForm.value.email) {
      if (this.validateEmail(this.userForm.value.email)) {
        this.invalidEmail = false;
      } else {
        this.invalidEmail = true;
        valid = false;
      }
    }

    
    let email =  data.email;
    let password = data.password;
    if (valid) {
    this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((user) => {
        this.authState = user;
        console.log("M-am logat");
        console.log(this.authState);
        localStorage.setItem('Auth', this.authState.refreshToken);
        this.router.navigate(['/home']);
      })
      .catch(error => {
        console.log(error);
        this.errorServer = true;
        this.errorMessage = error;
      }
    );
    
  }
 }

 googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider()
  return this.socialSignIn(provider);
}

private socialSignIn(provider) {
  return this.afAuth.auth.signInWithPopup(provider)
    .then((credential) =>  {
        this.authState = credential.user;
        console.log("M-am logat");
        this.router.navigate(['/home'])
    })
    .catch(error => {
      console.log(error);
      this.errorServer = true;
      this.errorMessage = error;
    });
}

// Sends email allowing user to reset password
resetPassword(data) {
  var valid = true;

    if (this.resetPasswordForm.value.email) {
      if (this.validateEmail(this.resetPasswordForm.value.email)) {
        this.errorPassword = false;
      } else {
        this.errorPassword = "Invalid email address";
        valid = false;
      }
    }

    if(valid){
       var auth = firebase.auth();
       let email =  data.email;
      return auth.sendPasswordResetEmail(email)
       .then(() => this.showMessage = true)
       .catch((error) =>{ 
           console.log(error)
        })
    }
 
}

goToResetPassword(){
  this.lostPassword = true;
}
backToSingIn(){
  this.lostPassword = false;
}

}
