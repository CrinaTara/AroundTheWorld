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

  searchMessageDisplayed: string = '';
  errorSearchMessageDisplay: boolean = false;

  weHaveUsers: boolean = false;

  modalRef: BsModalRef;

  userToDelete:any;


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
      that.getAllUsers();
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }
 

}
