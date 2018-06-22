import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from "@angular/router";
import * as firebase from 'firebase';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PostComponent } from '../post/post.component';
import { AngularFirestore } from 'angularfire2/firestore';
import { } from 'angular-modal-gallery';
import { SharedDataService } from '../../shared-data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { moment } from 'ngx-bootstrap/chronos/test/chain';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  allMyPosts = [];
  @ViewChild(PostComponent) postComponent: PostComponent;

  postModal: BsModalRef;
  weHavePosts = false;
  countryToDelete;

  authState: any = null;
  public userObject: any;
  public userObjectRetrived: any;
  private url: any;
  idPostToDelete: any;
  shortNameCountry: string;
  currentPeopleInCountry: any;
  nonDublicateCountries = [];

  modalRef: BsModalRef;
  writeComment: FormGroup;
  weHaveComments: boolean = false;
  allComments: any = [];

  constructor(public fb: FormBuilder,
    private dataService: SharedDataService,
    private db: AngularFirestore,
    private modalService: BsModalService,
    private afAuth: AngularFireAuth,
    private router: Router) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });

  }

  ngOnInit() {

    this.writeComment = this.fb.group({
      commentText: ['', Validators.required],
    })

    this.getMyPosts();
    this.getComments();
    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);

    this.nonDublicateCountries = this.userObject.countriesVisited;
    console.log(this.nonDublicateCountries);
    this.nonDublicateCountries = Array.from(new Set(this.nonDublicateCountries));
    console.log(this.nonDublicateCountries);

    console.log("HERE?");

    this.url = (this.userObject.profilePicture == '') ? 'assets/images/user.png' : this.userObject.profilePicture;
  }


  openPostModalWithComponent() {
    this.postModal = this.modalService.show(PostComponent, {
      class: 'modal-style modal-md modal-dialog-centered',
      backdrop: 'static'
    });

  }

  openEditModal(idPost) {
    const initialState = { isSelectedPost: idPost };
    console.log(idPost);
    this.postModal = this.modalService.show(PostComponent, {
      class: 'modal-style modal-md modal-dialog-centered',
      backdrop: 'static',
      initialState
    });

  }

  updateLocalStorage() {
    let that = this;
    const unsubscribe = this.db.collection("users").doc(this.authState.uid).ref
      .onSnapshot(function (doc) {
        console.log("Update Object");
        localStorage.setItem('User', JSON.stringify(doc.data()));
        that.userObjectRetrived = localStorage.getItem('User');
        that.userObject = JSON.parse(that.userObjectRetrived);

        that.nonDublicateCountries = that.userObject.countriesVisited;
        console.log(that.nonDublicateCountries);
        that.nonDublicateCountries = Array.from(new Set(that.nonDublicateCountries));
        console.log(that.nonDublicateCountries);

        unsubscribe();
      }, function (error) {
        console.log("Eroor local storage");
      });
  }

  updateDeleteCountriesVisitedInUserDB() {
    const removeArrayItem = (arr, itemToRemove) => {
      return arr.filter(item => item !== itemToRemove)
    }

    console.log(this.userObject.countriesVisited);
    console.log(this.shortNameCountry);
    console.log(this.userObject.countriesVisited.includes(this.shortNameCountry));

    let that = this;

    if (this.userObject.countriesVisited.includes(this.shortNameCountry)) {
      // let a = removeArrayItem(this.userObject.countriesVisited, this.shortNameCountry)
      const index1: number = this.userObject.countriesVisited.indexOf(this.shortNameCountry);
      if (index1 !== -1) {
        var a = this.userObject.countriesVisited.splice(index1, 1);

      }

      console.log(a);
      console.log(this.userObject.countriesVisited);

      let data = {
        countriesVisited: this.userObject.countriesVisited
      }
      this.db.collection("users").doc(this.authState.uid).set(data, { merge: true })
        .then(function () {
          that.updateLocalStorage();
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    }

  }

  addCommentToDB(valueData, IDPost) {
    console.log("ENTER KEY PRESS");
    console.log(valueData);
    var that = this;
    let now = moment();
    this.db.collection("comments").add({

      idPost: IDPost,
      commentText: valueData.commentText,
      creationDate: now.format('L'),
      creationHour: now.format('LT'),
      by: {
        idUser: this.authState.uid,
        userName: this.userObject.firstName + " " + this.userObject.lastName
      }

    })
      .then(function (docRef) {
        console.log("Document successfully written!");
        that.writeComment.patchValue({
          commentText: '',
        });
        // that.getComments
        // that.allComments = [];
        // that.getComments();
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);

      });
  }

  getComments() {
    let that = this;
    this.allMyPosts = [];
    const unsubscribe = this.db.collection("comments").ref.orderBy("creationDate", "asc").orderBy("creationHour", "asc")
      .onSnapshot(function (querySnapshot) {
        that.allComments = [];
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          that.allComments.push({ id: doc.id, ...doc.data() });
          that.weHaveComments = true;
        })
        console.log(that.allComments);

        // unsubscribe();
      });

  }


  getMyPosts = function () {
    let that = this;
    this.allMyPosts = [];
    const unsubscribe = this.db.collection("posts").ref.where("idUser", "==", this.authState.uid).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        that.allMyPosts = [];
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          that.allMyPosts.push({ id: doc.id, ...doc.data() });
          that.weHavePosts = true;
        })
        console.log(that.allMyPosts);
        // unsubscribe();
      });

  }

  deleteAPost() {
    console.log(this.idPostToDelete);
    const that = this;
    this.db.collection("posts").doc(this.idPostToDelete).delete().then(function () {
      console.log("Document successfully deleted!");
      that.updateCountryDB();
      that.deleteCommentPosts(that.idPostToDelete);
      that.updateTripDB();
      that.updateDeleteCountriesVisitedInUserDB();
      // that.getMyPosts();
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }

  deleteCommentPosts(idToDeletePost) {
    let that = this;

    const unsubscribe = this.db.collection("comments").ref
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          if (doc.data().idPost == idToDeletePost) {
            that.db.collection("comments").doc(doc.id).delete().then(function () {
              console.log("Document successfully deleted!");
            }).catch(function (error) {
              console.error("Error removing document: ", error);
            });
          }

        })

        unsubscribe();
      });



  }

  updateTripDB() {

  }

  updateCountryDB() {
    console.log("Country to database!");
    console.log(this.shortNameCountry);
    let that = this;

    const unsubscribe = this.db.collection("countries").doc(this.shortNameCountry).ref
      .onSnapshot(function (doc) {
        console.log(" data: ", doc.data());
        that.currentPeopleInCountry = doc.data().nrPeople;
        console.log(that.currentPeopleInCountry);
        unsubscribe();


        that.currentPeopleInCountry = that.currentPeopleInCountry - 1;
        console.log(that.currentPeopleInCountry);
        if (that.currentPeopleInCountry > 0) {
          let data = {
            nrPeople: that.currentPeopleInCountry
          }
          that.db.collection("countries").doc(that.shortNameCountry).set(data, { merge: true })
            .then(function () {
              console.log("Ok document written!");
            })
            .catch((error) => {
              console.error("Error adding document: ", error);
            });

        }
        else {

          const uns = that.db.collection("countries").doc(that.shortNameCountry).delete().then(function () {
            console.log("Document successfully deleted!");
            unsubscribe();

          }).catch(function (error) {
            console.error("Error removing document: ", error);
          });
        }

      }, function (error) {
        console.log("Error receiving data");
      });



  }

  openModal(template: TemplateRef<any>, idPost, shortName) {

    this.modalRef = this.modalService.show(template, { class: 'modal-md modal-dialog-centered' });
    this.idPostToDelete = idPost;
    this.shortNameCountry = shortName;
  }

  confirm(): void {
    this.deleteAPost();
    this.modalRef.hide();
  }

  decline(): void {
    this.modalRef.hide();
  }

}
