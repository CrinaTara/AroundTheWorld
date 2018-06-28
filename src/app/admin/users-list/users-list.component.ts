import { Component, OnInit, TemplateRef } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFirestore } from 'angularfire2/firestore';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  

  authState: any = null;

  accesPersonPageID: any = "";

  searchResponse: boolean = false;
  searcFriendsResuls = [];

  searchFriendsForm: FormGroup;

  public userObject: any;
  public userObjectRetrived: any;

  searchMessageDisplayed: string = '';
  errorSearchMessageDisplay: boolean = false;

  weHaveUsers: boolean = false;

  modalRef: BsModalRef;

  userToDelete:any;
  currentPeopleInCountry: number;

  allComments: any = [];
  shortNameCountry: any;
  idPostToDelete: any;


  constructor(private db: AngularFirestore, public fb: FormBuilder, private afAuth: AngularFireAuth,  private modalService: BsModalService,) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {
    this.searchFriendsForm = this.fb.group({
      search: ['', Validators.required],
    })

    this.getAllUsers();

    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);
  }

  getAllUsers(){
  
    let that = this;
    this.searcFriendsResuls = [];
    const unsubscribe = this.db.collection("users").ref
      .onSnapshot(function (querySnapshot) {
        this.searcFriendsResuls = [];
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          if (doc.id != that.authState.uid) {
            that.searcFriendsResuls.push({ id: doc.id, ...doc.data() });
            that.weHaveUsers = true;
          }
         
        })
        console.log(that.searcFriendsResuls);
        unsubscribe();
      });
  }

  getUsersSpecific(dataSearch) {
    this.searcFriendsResuls = [];
    let that = this;
    console.log("Here");
    let valueToCompare = dataSearch.search.toUpperCase();
    console.log(valueToCompare);

    let locationsSubscription = this.db.collection("users").snapshotChanges().map(actions => {
      return actions.map(a => {
        console.log("Am intart in getFriends!");
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        console.log(data.email + " data si id-ul " + id);
        // console.log(a);
        if (id != that.authState.uid) {
          if (data.firstName.toUpperCase().includes(valueToCompare) || data.lastName.toUpperCase().includes(valueToCompare)) {
            return { id, ...data };
          }
        }
        // string.includes(substring);
        console.log("But here?");
      });
    }).subscribe((querySnapshot) => {
      console.log(querySnapshot)
      querySnapshot.forEach((doc) => {
        console.log(doc);
        if (doc) {
          console.log(doc);
          {
            that.searcFriendsResuls.push(doc);
            that.searchResponse = true;
          }
        }

      });

      if (that.searcFriendsResuls.length == 0) {
        that.errorSearchMessageDisplay = true;
        that.searchMessageDisplayed = "No results found!"
      }
      else {
        that.errorSearchMessageDisplay = false;

      }

      locationsSubscription.unsubscribe();

    });
  }

  viewPersonPage(idPerson) {
    console.log(idPerson);
    this.accesPersonPageID = idPerson;
  }

  openDeleteUserModal(deleteUser: TemplateRef<any>, idUser) {

    this.userToDelete = idUser;
    console.log(this.userToDelete);
    this.modalRef = this.modalService.show(deleteUser, { class: 'modal-md modal-dialog-centered' });
   
  }

  confirm(): void {
    this.deleteAUser();
    this.modalRef.hide();
  }

  decline(): void {
    this.modalRef.hide();
  }

  deleteAUser(){
    console.log("delete");
    console.log(this.userToDelete);
    const that = this;
    this.db.collection("users").doc(this.userToDelete).delete().then(function () {
      console.log("Document successfully deleted!");
      that.deleteUserPosts();
      that.deleteTrips();
      that.getAllUsers();
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }

  deleteUserPosts(){
    let that = this;

    const unsubscribe = this.db.collection("posts").ref.where("idUser" , "==" , this.userToDelete)
      .onSnapshot(function (querySnapshot) {
        that.allComments = [];
        querySnapshot.forEach(function (doc) {
         console.log(doc.id, " => ", doc.data());
         that.idPostToDelete = doc.id;
         that.deleteAllPost();
         
         that.shortNameCountry = doc.data().aboutLocation.countryShort;

        })
        console.log(that.allComments);
        // unsubscribe();
      });
  }


  deleteAllPost() {
    console.log(this.idPostToDelete);
    const that = this;
    this.db.collection("posts").doc(this.idPostToDelete).delete().then(function () {
      console.log("Document successfully deleted!");
      // that.updateCountryDB();
      that.deleteACommentPosts(that.idPostToDelete);
      that.updateCountryDB();
      that.updateDeleteCountriesVisitedInUserDB();
      // that.getMyPosts();
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }



  deleteTrips(){
    let that = this;

    const unsubscribe = this.db.collection("trips").ref.where("idUser" , "==" , this.userToDelete)
      .onSnapshot(function (querySnapshot) {
        that.allComments = [];
        querySnapshot.forEach(function (doc) {
         console.log(doc.id, " => ", doc.data());
        
         that.deleteATrip(doc.id);
         
         that.shortNameCountry = doc.data().aboutLocation.countryShort;

        })
        console.log(that.allComments);
        // unsubscribe();
      });
  }

  deleteATrip(param){

    const that = this;
    this.db.collection("trips").doc(param).delete().then(function () {
      console.log("Document successfully deleted!");
     
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }

  deleteACommentPosts(idToDeletePost) {
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
 

}
