import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { PostComponent } from '../post/post.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
import { AdvancedLayout, Image, PlainGalleryConfig, PlainGalleryStrategy } from 'angular-modal-gallery';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.scss']
})
export class TripDetailsComponent implements OnInit {
  idPostToDelete: any;

  public params: any;
  tripInformations: any;

  @ViewChild(PostComponent) postComponent: PostComponent;

  tripListPosts: any = [];
  weHavePosts: boolean = false;
  tripDeletedMessage: boolean = false;
  imagesToDisplay: Image[] = [];

  postsILiked = [];
  dublicate = [];
  weHaveComments: boolean = false;
  allComments: any = [];
  writeComment: FormGroup;

  public userObject: any;
  public userObjectRetrived: any;
  authState: any = null;

  private chart: AmChart;

  postModal: BsModalRef;
  modalRef: BsModalRef;
  listOFcolors = ["#FF0F00", "#FF6600", "#FF9E01", "#FCD202", "#F8FF01", "#B0DE09", "#04D215", "#0D8ECF", "#0D52D1",
                  "#2A0CD0", "#8A0CCF", "#CD0D74", "#754DEB", "#DDDDDD", "#333333", "#754DEB"];

  listOfBugetAndCities: any = [];
  totalBugetThisTrip: number = 0;

  constructor(private afAuth: AngularFireAuth,
    private modalService: BsModalService, private db: AngularFirestore, private route: ActivatedRoute, private router: Router,
    private AmCharts: AmChartsService, public fb: FormBuilder
  ) {
    this.params = this.route.params;
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {
    
    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);
    
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

  showChartD() {
    const that = this;

    this.chart = this.AmCharts.makeChart("chartdiv", {
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
    const unsubscribe = this.db.collection("posts").ref.where("idTrip", "==", this.params._value.id).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        that.tripListPosts = [];
        that.postsILiked = [];
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

          that.tripListPosts.push({ id: doc.id, ...doc.data(), images: images, dublicate: th.postsILiked});

          that.weHavePosts = true;

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
      this.modalRef.hide();
    }).catch(function (error) {
      console.error("Error removing document: ", error);
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

  deleteAPost() {
    console.log(this.idPostToDelete);
    const that = this;
    this.db.collection("posts").doc(this.idPostToDelete).delete().then(function () {
      console.log("Document successfully deleted!");
      // that.updateCountryDB();
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
