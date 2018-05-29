import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { Router } from "@angular/router";
import * as firebase from 'firebase';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})


export class SignUpComponent implements OnInit {

  userForm: FormGroup;
  authState: any = null;

  emailExists: boolean = false;
  registerSuccess: boolean = false;
  error: boolean = false;
  errorServer: boolean = false;
  errorMessage: string;
  invalidEmail: boolean = false;
  samePassword: boolean = false;
  wrongPassword: boolean = false;
  

  constructor(public fb: FormBuilder, private afAuth: AngularFireAuth, private router:Router,  private db: AngularFirestore) { 
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmation: ['', Validators.required]
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

  registeruserForm() {
    this.registerSuccess = false;
    this.invalidEmail = false;
    this.error = false;
    var valid = true;
    this.samePassword = false;
    var data = {
      user: this.userForm.value,
    }

    if (this.userForm.status == 'VALID') {
      this.error = false;
    } else {
      this.error = true;
      valid = false;
    }

    if (this.userForm.value.password === this.userForm.value.confirmation) {
      this.samePassword = false;
    } else {
      this.samePassword = true;
      valid = false;
    }
     

    if (this.userForm.value.email) {
      if (this.validateEmail(this.userForm.value.email)) {
        this.invalidEmail = false;
      } else {
        this.invalidEmail = true;
        valid = false;
      }
    }

    if (valid) {
      if(this.userForm.valid) {
        let email= this.userForm.value.email
        let password= this.userForm.value.password
        console.log(this.userForm.value);
        this.afAuth.auth.createUserWithEmailAndPassword( email,password)
        .then(
          (success) => {
            console.log('Aici');
          console.log(success);
          let data = {
            email: this.userForm.value.email,
            role: 'user',
            firstName: this.userForm.value.firstName,
            lastName: this.userForm.value.lastName,
            bio: '',
            homeBase: '',
            profilePicture: '',
            nrTrips: 0,
            following: [],
            followers: []
          }
          this.db.collection("users").doc(success.uid).set(data)
            .then(function (docRef) {
              // console.log("Document written with ID: ", docRef.id);
            })
            .catch(function (error) {
              console.error("Error adding document: ", error);
            });
          this.registerSuccess = true;
          
        }).catch(
          (err) => {
          console.log(err);
          this.errorServer = true;
          this.errorMessage = err;
        })
      }
    }
  }



}
