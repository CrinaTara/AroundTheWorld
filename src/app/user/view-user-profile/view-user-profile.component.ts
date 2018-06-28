import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef, Inject, HostListener } from '@angular/core';
// import { FindFriendsComponent } from '../find-friends/find-friends.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdvancedLayout, Image, PlainGalleryConfig, PlainGalleryStrategy } from 'angular-modal-gallery';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { DOCUMENT } from "@angular/platform-browser";

@Component({
  selector: 'app-view-user-profile',
  templateUrl: './view-user-profile.component.html',
  styleUrls: ['./view-user-profile.component.scss']
})
export class ViewUserProfileComponent implements OnInit {

  authState: any = null;
  navIsFixed: boolean;

  imagesToDisplay: Image[] = [];
  idPostToDelete: any;
  
  modalRef: BsModalRef;
  userToDelete:any;
  
  public params: any;
  userPersonalInformation: any;
  url: any;

  userListPosts = [];
  weHavePosts = false;
  userDeletedMessage = false;

  currentFollowing = [];
  currentFollowers = [];
  postsILiked = [];
  dublicate = [];

  weHaveComments: boolean = false;
  allComments: any = [];

  writeComment: FormGroup;
  writePostWarnning: FormGroup;
  writeCommentWarnning: FormGroup;

  warnPostMess: boolean = false;
  warnCommMess: boolean = false;

  isFollowing: boolean = false;
  public userObject: any;
  public userObjectRetrived: any;
  idPostWarning: any;
  idCommWarning: any;
  warnPostText: string;
  warnCommText: string;
  postCommWarn: any;
  idCommToDelete: any;
  postIdToWarn: any;
  shortNameCountry: any;
  currentPeopleInCountry: any;

  // @ViewChild(FindFriendsComponent) viewPerson : FindFriendsComponent;
  constructor(public fb: FormBuilder,  @Inject(DOCUMENT) private document: Document,
    private modalService: BsModalService, private afAuth: AngularFireAuth, private db: AngularFirestore, private route: ActivatedRoute, private router: Router) {
    this.params = this.route.params;

    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });

  }


  ngOnInit() {

    this.writeComment = this.fb.group({
      commentText: ['', Validators.required],
    }),

    this.writePostWarnning = this.fb.group({
      postWarnText: ['', Validators.required],
    }),

    this.writeCommentWarnning = this.fb.group({
      commWarnText: ['', Validators.required],
    })

    
    this.getTheFollowingPersons();
    console.log(this.params._value.id);
    this.getComments();
    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);
    
    this.getUserData();
    this.getUserPosts();
    this.getFollowersFromIdPerson();
    // this.getLikedPosts();
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
      if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
          this.navIsFixed = true;
      } else if (this.navIsFixed && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 10) { this.navIsFixed = false; } } scrollToTop() { (function smoothscroll() { var currentScroll = document.documentElement.scrollTop || document.body.scrollTop; if (currentScroll > 0) {
              window.requestAnimationFrame(smoothscroll);
              window.scrollTo(0, currentScroll - (currentScroll / 5));
          }
      })();
  }


  getUserData() {
    let that = this;
    this.db.collection("users").doc(this.params._value.id).ref.get().then(function (doc) {
      if (doc.exists) {
        console.log("User data:", doc.data());
        that.userPersonalInformation = doc.data();
        that.url = (that.userPersonalInformation.profilePicture == '') ? 'assets/images/user.png' : that.userPersonalInformation.profilePicture;
      } else {
        console.log("No such document!");
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });
  }

  getUserPosts() {
    this.userListPosts = [];
    this.postsILiked = [];
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("idUser", "==", this.params._value.id).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        that.userListPosts = [];
        that.postsILiked = [];
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          that.postsILiked = [];
          let images: Image[] = [];

          for(let i= 0 ; i< doc.data().photos.length; i++){
            images.push(new Image(i, {
              img: doc.data().photos[i]
            }))
          }

          for(let i in doc.data().likedByUsers){
            that.postsILiked.push(doc.data().likedByUsers[i]) ;
          }    

          let th = that;
          that.userListPosts.push({id: doc.id, ...doc.data(), images: images, dublicate: th.postsILiked});
          that.weHavePosts = true; 
          
        })
        console.log(that.userListPosts);
        // unsubscribe();
      });

  }

  
  openModal(template: TemplateRef<any>, idPost, shortName) {

    this.modalRef = this.modalService.show(template, { class: 'modal-md modal-dialog-centered' });
    this.idPostToDelete = idPost;

  }

  openModalPostWarning(warningPostModal: TemplateRef<any>, post, postId){
    this.modalRef = this.modalService.show(warningPostModal, { class: 'modal-md modal-dialog-centered' });
    this.idPostWarning = post;
    this.postIdToWarn = postId;
  }

  openModalCommentWarning(warningCommentModal: TemplateRef<any>, comm, post,  commId){
   
    this.modalRef = this.modalService.show(warningCommentModal, { class: 'modal-md modal-dialog-centered' });
    this.idCommWarning = comm;
    this.postCommWarn = post;
    this.idCommToDelete = commId;
   
  }

  openDeleteComm(deleteCommentModal: TemplateRef<any>, commId){
    this.modalRef = this.modalService.show(deleteCommentModal, { class: 'modal-md modal-dialog-centered' });
    this.idCommToDelete = commId;
  }

  confirm(): void {
    this.deleteAPost();
    this.modalRef.hide();
  }

  decline(): void {
    this.modalRef.hide();
  }

  confirmDeleteComment(){
    console.log(this.idCommToDelete);
    const that = this;
    this.db.collection("comments").doc(this.idCommToDelete).delete().then(function () {
      console.log("Document successfully deleted!");
      // that.deleteCommentPosts(that.idPostToDelete);
      that.modalRef.hide();
      // that.getMyPosts();
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }

  confirmPostWarning(text){
    console.log(text);
    console.log(this.idPostWarning);
    console.log(this.postIdToWarn);
    var that = this;
    let now = moment();
    this.db.collection("warnings").add({

      postName: that.idPostWarning.postName,
      tripPost: that.idPostWarning.tripName,
      idPost: that.postIdToWarn,
      warningText: text.postWarnText,
      creationDate: now.format('L'),
      by : "ADMIN",
      idUser: that.params._value.id,
      seen: "no",
      type: 'postwarning'
    })
      .then(function (docRef) {
        console.log("Document successfully written!");
        that.writePostWarnning.patchValue({
          postWarnText: '',
        });
        that.warnPostMess = true;
        that.warnPostText = " Message succesfully sent!";
        // that.modalRef.hide();
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
        that.warnPostMess = true;
        that.warnPostText = "Error."
      });
  }

  confirmCommentWarning(text, idComm){
    console.log(text);
    console.log(this.idCommWarning);
    console.log(this.postCommWarn);
    var that = this;
    let now = moment();
    this.db.collection("warnings").add({

      commText: that.idCommWarning.commentText,
      tripPostComm: that.postCommWarn.tripName,
      warningText: text.commWarnText,
      creationDate: now.format('L'),
      idComment:  that.idCommToDelete,
      by : "ADMIN",
      byThisUser: that.idCommWarning.by.userName,
      idUser: that.params._value.id,
      seen: "no",
      type: 'commentwarning'
    })
      .then(function (docRef) {
        console.log("Document successfully written!");
        that.writeCommentWarnning.patchValue({
          commWarnText: '',
        });
        that.warnCommMess = true;
        that.warnCommText = " Message succesfully sent!";
        // this.modalRef.hide();
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
        that.warnCommMess = true;
        that.warnCommText = "Error."
      });
  }

  deleteAPost() {
    console.log(this.idPostToDelete);
    const that = this;
    this.db.collection("posts").doc(this.idPostToDelete).delete().then(function () {
      console.log("Document successfully deleted!");
      that.deleteCommentPosts(that.idPostToDelete);
     
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


  
  openDeleteUserModal(deleteUser: TemplateRef<any>, idUser) {

    this.userToDelete = idUser;
    console.log(this.userToDelete);
    this.modalRef = this.modalService.show(deleteUser, { class: 'modal-md modal-dialog-centered' });
   
  }

  confirmDeleteUser(): void {
    this.deleteAUser();
    this.modalRef.hide();
  }

  deleteAUser(){
    console.log("delete");
    console.log(this.userToDelete);
    const that = this;
    this.db.collection("users").doc(that.params._value.id).delete().then(function () {
      console.log("Document successfully deleted!");
      that.userDeletedMessage = true;
      // that.getAllUsers();
      that.deleteUserPosts();
      that.deleteTrips();
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }

  deleteUserPosts(){
    let that = this;

    const unsubscribe = this.db.collection("posts").ref.where("idUser" , "==" , this.params._value.id)
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

    const unsubscribe = this.db.collection("trips").ref.where("idUser" , "==" , this.params._value.id)
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

  customPlainGalleryRowConfig: PlainGalleryConfig = {
    strategy: PlainGalleryStrategy.CUSTOM,
    layout: new AdvancedLayout(-1, true)
  };
  
  openImageModalRow(image: Image, images) {
    this.imagesToDisplay = images;
    console.log(this.imagesToDisplay);
    console.log('Opening modal gallery from custom plain gallery row, with image: ', image);
    const index: number = this.getCurrentIndexCustomLayout(image, this.imagesToDisplay);
    this.customPlainGalleryRowConfig = Object.assign({}, this.customPlainGalleryRowConfig, { layout: new AdvancedLayout(index, true) });
  }

  private getCurrentIndexCustomLayout(image: Image, imagesToDisplay: Image[]): number {
    return image ? imagesToDisplay.indexOf(image) : -1;
  }


  getTheFollowingPersons() {

    let that = this;


    const unsubscribe = this.db.collection("users").doc(this.authState.uid).ref
      .onSnapshot(function (doc) {
        console.log(" data: ", doc.data());
        that.currentFollowing = doc.data().following;
        that.isFollowing = that.currentFollowing.includes(that.params._value.id);
       
        console.log("Following: " + that.currentFollowing);
        console.log("Liked posts: " + that.postsILiked);
        unsubscribe();
      }, function (error) {
        console.log("Error receiving data");
      });

  }

  unfollowAPerson() {
    console.log("Following: " + this.currentFollowing);
    console.log("Followers: " + this.currentFollowers);
    const index1: number = this.currentFollowing.indexOf(this.params._value.id);
    if (index1 !== -1) {
      this.currentFollowing.splice(index1, 1);
    }

    const index2: number = this.currentFollowers.indexOf(this.authState.uid);
    if (index2 !== -1) {
      this.currentFollowers.splice(index2, 1);
    }

    this.setDB();

  }

  getFollowersFromIdPerson() {
    let that = this;

    const unsubscribe = this.db.collection("users").doc(that.params._value.id).ref
      .onSnapshot(function (doc) {
        console.log(" Followers: ", doc.data());
        that.currentFollowers = doc.data().followers;
        console.log(that.currentFollowers);
        unsubscribe();
      }, function (error) {
        console.log("Error receiving data");
      });
  }

  followPerson() {
    console.log("Following: " + this.currentFollowing);
    console.log("Followers: " + this.currentFollowers);
    this.currentFollowing.push(this.params._value.id);
    this.currentFollowers.push(this.authState.uid);
    this.setDB();
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

  addCommentToDB(valueData, IDPost){
    console.log("ENTER KEY PRESS");
    console.log(valueData);
    var that = this;
    let now = moment();
    this.db.collection("comments").add({

      idPost: IDPost,
      commentText: valueData.commentText,
      creationDate: now.format('L'),
      creationHour: now.format('LT'),
      by :{
        idUser: this.authState.uid,
        userName: this.userObject.firstName + " " + this.userObject.lastName
      }

    })
      .then(function (docRef) {
        console.log("Document successfully written!");
        that.writeComment.patchValue({
          commentText: '',
        });
        
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
       
      });
  }

  getComments(){
    let that = this;

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


  setDB() {
    let dataFollowers = {
      followers: this.currentFollowers
    }

    let dataFollowing = {
      following: this.currentFollowing
    }

    let that = this;

    const unsubscribe = that.db.collection("users").doc(that.authState.uid).set(dataFollowing, { merge: true })
      .then(function (docRef) {
        console.log("Document following ok");
        that.updateLocalStorage();
      })
      .catch((error) => {
        console.log(error);
      })

    that.db.collection("users").doc(that.params._value.id).set(dataFollowers, { merge: true })
      .then(function (docRef) {
        console.log("Document followers written ok");
        that.getTheFollowingPersons();
        that.updateLocalStorage();
      })
      .catch((error) => {
        console.log(error);
      })


  }

  likeAPost(idPost){
    console.log(idPost);
    console.log(this.postsILiked);
    this.postsILiked.push(this.authState.uid);

    let data = {
      likedByUsers:  this.postsILiked
    }

    let that = this;
    console.log("Post I like : " + data);

    const unsubscribe = this.db.collection("posts").doc(idPost).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document following ok");
        // that.getLikedPosts();
      })
      .catch((error) => {
        console.log(error);
      })
  }


  dislikeAPost(idPost){

    const index2: number = this.postsILiked.indexOf(this.authState.uid);
    if (index2 !== -1) {
      this.postsILiked.splice(index2, 1);
    }

    let data = {
      likedByUsers:  this.postsILiked
    }

    let that = this;

    console.log("Post I like : " + data);


    const unsubscribe = this.db.collection("posts").doc(idPost).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document following ok");
        // that.getLikedPosts();
      })
      .catch((error) => {
        console.log(error);
      })
  }

}
