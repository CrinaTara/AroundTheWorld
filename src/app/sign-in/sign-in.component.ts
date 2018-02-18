import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from "@angular/router";
import * as firebase from 'firebase';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  userForm: FormGroup;
  authState: any = null;

  errorServer: boolean = false;
  errorMessage: string;
  invalidEmail: boolean = false;

  constructor(public fb: FormBuilder, private afAuth: AngularFireAuth, private router:Router) { 
    this.userForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
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
        this.router.navigate(['/home'])
      })
      .catch(error => {
        console.log(error);
        this.errorServer = true;
        this.errorMessage = error;
      }
    );
  }
 }

}
