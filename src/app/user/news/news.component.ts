import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { AdvancedLayout, Image, PlainGalleryConfig, PlainGalleryStrategy } from 'angular-modal-gallery';
import { DOCUMENT } from "@angular/platform-browser";

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  authState: any = null;
  loading:boolean = true;

  navIsFixed: boolean;

  imagesToDisplay: Image[] = [];

  public params: any;
  public searchedItem: any;
  weHavePosts: boolean = false;
  noResult = false;

  postsILiked = [];
  dublicate = [];

  listPosts = [];

  countryData: any;
  countryListPosts = [];
  citySearchName: any;

  public userObject: any;
  public userObjectRetrived: any;


  searchCityForm: FormGroup;
  weHaveComments: boolean = false;
  allComments: any = [];
  writeComment: FormGroup;
  monthsPeopleArr: any;

  constructor(private route: ActivatedRoute,
    private db: AngularFirestore, public fb: FormBuilder,
    private afAuth: AngularFireAuth,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.params = this.route.params;
    this.searchedItem = this.params._value.name;

    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {
    this.searchCityForm = this.fb.group({
      search: ['', Validators.required],
    });

    this.writeComment = this.fb.group({
      commentText: ['', Validators.required],
    });

    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);

    this.postsILiked = [];
    this.dublicate = [];
    this.countryData = [];
    this.getNewestPosts();
    this.getComments();

  }

  getNewestPosts(){
   
    this.listPosts = [];
    let that = this;

    this.postsILiked = [];
    const unsubscribe = this.db.collection("posts").ref.where("idUser", "==", "ihg7CJSAv1h9Ws9JvriBATBqqc42").orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        that.listPosts = [];
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

          that.listPosts.push({id: doc.id, ...doc.data(), images: images, dublicate: th.postsILiked});

          that.weHavePosts = true;
          that.loading = false;
          // unsubscribe();
        })
        console.log(that.listPosts);
      });
  }

  onScroll() {
    console.log('scrolled!!');
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



  getCountryData() {
    let that = this;
    console.log("Get country data")
    this.db.collection("countries").doc(this.searchedItem).ref.get().then(function (doc) {
      if (doc.exists) {
        console.log("Country data:", doc.data());
        that.countryData = doc.data();

      } else {
        console.log("No such document!");
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
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


  searchCity(data) {
    console.log(data);
    this.countryListPosts = [];
    this.citySearchName = data.search;
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("aboutLocation.city", "==", data.search).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());

          that.countryListPosts.push(doc.data());
          that.weHavePosts = true;
          unsubscribe();
        })
        console.log(that.countryListPosts);

      });
  }


  likeAPost(idPost) {
    console.log(idPost);
    console.log(this.postsILiked);
    this.postsILiked.push(this.authState.uid);

    let data = {
      likedByUsers: this.postsILiked
    }

    let that = this;


    const unsubscribe = this.db.collection("posts").doc(idPost).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document following ok");
      })
      .catch((error) => {
        console.log(error);
      })
  }


  dislikeAPost(idPost) {

    const index2: number = this.postsILiked.indexOf(this.authState.uid);
    if (index2 !== -1) {
      this.postsILiked.splice(index2, 1);
    }

    let data = {
      likedByUsers: this.postsILiked
    }

    let that = this;

    const unsubscribe = this.db.collection("posts").doc(idPost).set(data, { merge: true })
      .then(function (docRef) {
        console.log("Document following ok");
      })
      .catch((error) => {
        console.log(error);
      })
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
        // that.allComments = [];
        // that.getComments();
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


}
