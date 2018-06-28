import { Component, OnInit, ViewChild, TemplateRef, Inject, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { PostComponent } from '../post/post.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
import { AdvancedLayout, Image, PlainGalleryConfig, PlainGalleryStrategy } from 'angular-modal-gallery';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DOCUMENT } from "@angular/platform-browser";

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.scss']
})
export class TripDetailsComponent implements OnInit {
  idPostToDelete: any;

  loading:boolean = false;

  navIsFixed: boolean;
  public params: any;
  tripInformations: any;

  @ViewChild(PostComponent) postComponent: PostComponent;

  tripListPosts: any = [];
  weHavePosts: boolean = false;
  tripDeletedMessage: boolean = false;
  weHavePublicPosts: boolean = false;
  weHavePrivatePosts:boolean = false;

  imagesToDisplay: Image[] = [];

  allPrivateTripPosts = [];
  allPublicTripPosts = [];

  postsILiked = [];
  dublicate = [];
  weHaveComments: boolean = false;
  allComments: any = [];
  writeComment: FormGroup;

  public userObject: any;
  public userObjectRetrived: any;
  authState: any = null;

  currentPeopleInCountry: any;
  nonDublicateCountries = [];
  shortNameCountry: string;

  private chartBuget: AmChart;

  postModal: BsModalRef;
  modalRef: BsModalRef;
  listOFcolors = ["#FF0F00", "#FF6600", "#FF9E01", "#FCD202", "#F8FF01", "#B0DE09", "#04D215", "#0D8ECF", "#0D52D1",
                  "#2A0CD0", "#8A0CCF", "#CD0D74", "#754DEB", "#DDDDDD", "#333333", "#754DEB"];

  listOfBugetAndCities: any = [];
  totalBugetThisTrip: number = 0;

  constructor(private afAuth: AngularFireAuth,
    private modalService: BsModalService, private db: AngularFirestore, private route: ActivatedRoute, private router: Router,
    private AmCharts: AmChartsService, public fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.params = this.route.params;
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {
    
    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);

    this.nonDublicateCountries = this.userObject.countriesVisited;
    console.log(this.nonDublicateCountries);
    this.nonDublicateCountries = Array.from(new Set(this.nonDublicateCountries));
    console.log(this.nonDublicateCountries);
    
    this.writeComment = this.fb.group({
      commentText: ['', Validators.required],
    })
    this.getComments();

    this.getTripData();
    this.getTripPosts();
   
  }

  getTripData() {
    let that = this;
    this.db.collection("trips").doc(this.params._value.id).ref.get().then(function (doc) {
      if (doc.exists) {
        console.log("Trip data:", doc.data());
        that.tripInformations = doc.data();

      } else {
        console.log("No such document!");
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });
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
  
  
  showChartD() {
    const that = this;

    this.loading = false;

    this.chartBuget = this.AmCharts.makeChart("chartdiv", {
      "theme": "light",
      "type": "serial",
      "startDuration": 2,
      "dataProvider": that.listOfBugetAndCities ,
      "valueAxes": [{
        "position": "left",
        "title": "Euro",
        "axisAlpha": 0,
        "gridAlpha": 0
      }],
      "graphs": [{
        "balloonText": "[[category]]: <b>[[value]]</b>",
        "colorField": "color",
        "fillAlphas": 0.85,
        "lineAlpha": 0.1,
        "type": "column",
        "topRadius": 1,
        "valueField": "buget"
      }],
      "depth3D": 35,
      "angle": 20,
      "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryField": "city",
      "categoryAxis": {
        "gridPosition": "start",
        "axisAlpha": 0,
        "gridAlpha": 0

      },
      "export": {
        "enabled": true
      }

    }, 0);


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

  getTripPosts() {
    let that = this;
    this.postsILiked = [];
    this.tripListPosts = [];
    this.allPrivateTripPosts = [];
    this.allPublicTripPosts = [];
    this.loading = true;
    const unsubscribe = this.db.collection("posts").ref.where("idTrip", "==", this.params._value.id).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        that.tripListPosts = [];
        that.postsILiked = [];
        that.allPrivateTripPosts = [];
        that.allPublicTripPosts = [];
        that.listOfBugetAndCities = [];
        querySnapshot.forEach(function (doc) {
          that.postsILiked = [];
          console.log("Trip posts");
          console.log(doc.id, " => ", doc.data());
          if(doc.data().buget != ''){
            let dat = {
              "city": doc.data().aboutLocation.city,
              "buget": doc.data().buget,
              "color": that.listOFcolors[doc.data().buget%16]
            }
            that.listOfBugetAndCities.push(dat);
            that.totalBugetThisTrip += doc.data().buget;
          }

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

          if(doc.data().privacy == "public")
          {
            that.allPublicTripPosts.push({ id: doc.id, ...doc.data(), images: images, dublicate: th.postsILiked});
            that.weHavePosts = true;
            that.weHavePublicPosts = true;

          }
          else if(doc.data().privacy == "private"){
            that.allPrivateTripPosts.push({ id: doc.id, ...doc.data(), images: images, dublicate: th.postsILiked});
            that.weHavePosts = true;
            that.weHavePrivatePosts = true;
          }

          that.tripListPosts.push({ id: doc.id, ...doc.data(), images: images, dublicate: th.postsILiked});

          // that.weHavePosts = true;

        })
        console.log(that.tripListPosts);
        console.log(that.listOfBugetAndCities);
        that.showChartD();
        // unsubscribe();
      });

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

  openDeleteTripModal(deleteTrip: TemplateRef<any>) {
    this.modalRef = this.modalService.show(deleteTrip, { class: 'modal-md modal-dialog-centered' });
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

  confirmDeleteTrip() {
    const that = this;
    this.db.collection("trips").doc(this.params._value.id).delete().then(function () {
      console.log("Document successfully deleted!");
      that.tripDeletedMessage = true;
      that.modalRef.hide();
      that.updateUserProfile();
      that.deletePostsTrip();
    }).catch(function (error) {
      console.error("Error removing document: ", error);
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

  updateUserProfile() {
    var that = this;
    let numbr = 0;
    const unsubscribe = this.db.collection("trips").ref.where("idUser", "==", this.authState.uid)
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          numbr += 1;
        })
        console.log(numbr);
        unsubscribe();
        let data = {
          nrTrips: numbr
        }
        console.log("NUMERB OF: " + data.nrTrips);
        let th = that;
        that.db.collection("users").doc(that.authState.uid).set(data, { merge: true })
          .then(function () {
            th.updateLocalStorage();
          })
          .catch((error) => {
            console.error("Error adding document: ", error);
          });
      });

  }

  updateLocalStorage() {
    let that = this;
    const unsubscribe = this.db.collection("users").doc(this.authState.uid).ref
      .onSnapshot(function (doc) {
        // var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log("UPDATE LOCAL")
        console.log(" data: ", doc.data());
        localStorage.setItem('User', JSON.stringify(doc.data()));

        that.userObjectRetrived = localStorage.getItem('User');
        that.userObject = JSON.parse(that.userObjectRetrived);

        
        that.nonDublicateCountries = that.userObject.countriesVisited;
        console.log(that.nonDublicateCountries);
        that.nonDublicateCountries = Array.from(new Set(that.nonDublicateCountries));
        console.log(that.nonDublicateCountries);
        // unsubscribe();
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

  deletePostsTrip(){
    let that = this;

    const unsubscribe = this.db.collection("posts").ref.where("idTrip" , "==" , this.params._value.id)
      .onSnapshot(function (querySnapshot) {
        that.allComments = [];
        querySnapshot.forEach(function (doc) {
         console.log(doc.id, " => ", doc.data());
         that.idPostToDelete = doc.id;
         that.deleteAPost();
         
         that.shortNameCountry = doc.data().aboutLocation.countryShort;

        })
        console.log(that.allComments);
        // unsubscribe();
      });
  }


  deleteAPost() {
    console.log(this.idPostToDelete);
    const that = this;
    this.db.collection("posts").doc(this.idPostToDelete).delete().then(function () {
      console.log("Document successfully deleted!");
      // that.updateCountryDB();
      that.deleteCommentPosts(that.idPostToDelete);
      that.updateCountryDB();
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
