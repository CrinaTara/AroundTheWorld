import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { PostComponent } from '../post/post.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.scss']
})
export class TripDetailsComponent implements OnInit {

  public params: any;
  tripInformations: any;

  @ViewChild(PostComponent) postComponent: PostComponent;

  tripListPosts: any = [];
  weHavePosts: boolean = false;
  tripDeletedMessage: boolean = false;
  private chart: AmChart;

  postModal: BsModalRef;
  modalRef: BsModalRef;
  listOFcolors = ["#FF0F00", "#FF6600", "#FF9E01", "#FCD202", "#F8FF01", "#B0DE09", "#04D215", "#0D8ECF", "#0D52D1",
                  "#2A0CD0", "#8A0CCF", "#CD0D74", "#754DEB", "#DDDDDD", "#333333", "#754DEB"];

  listOfBugetAndCities: any = [];
  totalBugetThisTrip: number = 0;

  constructor(private afAuth: AngularFireAuth,
    private modalService: BsModalService, private db: AngularFirestore, private route: ActivatedRoute, private router: Router,
    private AmCharts: AmChartsService,
  ) {
    this.params = this.route.params;
  }

  ngOnInit() {
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

  getTripPosts() {
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("idTrip", "==", this.params._value.id).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
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

          that.tripListPosts.push({ id: doc.id, ...doc.data() });
          that.weHavePosts = true;

        })
        console.log(that.tripListPosts);
        console.log(that.listOfBugetAndCities);
        that.showChartD();
        unsubscribe();
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

  }

  confirm(): void {
    // this.deleteAPost();
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

}
