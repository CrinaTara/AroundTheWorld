import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from "@angular/router";
import * as firebase from 'firebase';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
import { AngularFirestore } from 'angularfire2/firestore';
import { SharedDataService } from '../../shared-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  authState: any = null;
  private chart: AmChart;
  arr: any= [];
  // svg path for target icon
  targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

  relevantCities = [];

  coloredVisitedCountries = [];

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, private router: Router, 
              private AmCharts: AmChartsService,
              private dataService: SharedDataService) {

    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

   ngOnInit() {
    console.log(this.authState.uid);
    this.getAllPlaces();
   
  }

 ngAfterViewInit(){

 }

 async another() {
    
    var that = this;
    
    this.chart = this.AmCharts.makeChart("chartdiv", {
      "type": "map",
      "theme": "light",
      "dataProvider": {
        "map": "worldLow",
        "getAreasFromMap": true,
        "areas": that.coloredVisitedCountries
      },

      "areasSettings": {
        "autoZoom": true,
        "selectedColor": "#201E50"
      },

      "smallMap": {},
      "export": {
        "enabled": true,
        "position": "bottom-right",
        "reviver": function a(obj, svg) {
          var className = this.setup.chart.classNamePrefix + "-map-area";

          // ONLY APPLY ON MAP AREAS
          if (obj.classList.indexOf(className) != -1) {

            // GET AREA ID THROUGH CLASSNAME
            obj.id = obj.classList[1].split("-").pop();

            // BACKUP ORIGINAL TO SVG METHOD
            obj.toSVG_BACKUP = obj.toSVG;

            // BYPASS TOSVG TO INJECT ADDITIONAL PARAMETER
            obj.toSVG = function (reviver) {
              var string = this.toSVG_BACKUP.apply(this, arguments);
              var explode = string.split(" "); // quick and dirty
              var tag = explode.shift();

              // INJECT AREA ID
              explode.unshift("id=\"" + this.id + "\"");

              // PLACE BACK THE TAG
              explode.unshift(tag);

              // MERGE IT; RETURN IT;
              string = explode.join(" ");

              return string;
            }
          }
        }
      },
      "listeners": [{
        event: 'init',
        method: function (event) {
          var map = event.chart;
          console.log(that.relevantCities);
          // populate the city dropdown when the page loads
          // for (let i = 0; i < that.relevantcities.length; i++) { 
          //   console.log(that.relevantcities[i])
          //   map.dataProvider.images.push(that.relevantcities[i]);
          // }
          that.relevantCities.forEach(function (arrayItem) {
            console.log(arrayItem);
            var city = arrayItem;
            
            city.svgPath = that.targetSVG;
            city.zoomLevel = 5;
            city.scale = 1;
            city.color = "black";
          
            // add city object to map
            map.dataProvider.images.push(city);
          });
          map.validateData();
        }
      }],

    });


  }

  ngOnDestroy() {
    if (this.chart) {
      this.AmCharts.destroyChart(this.chart);
    }
  }

   async getAllPlaces() {
    console.log(this.authState.uid);
    var that = this;
    // this.db.collection('posts', ref => ref.where('idUser', '==', this.authState.uid) )
    // .ref.get()
    //   .then(function (querySnapshot) {
    //     querySnapshot.forEach(function (doc) {
    //       // doc.data() is never undefined for query doc snapshots
    //       console.log(doc.id, " => ", doc.data());
    //     });
    //   })
    //   .catch(function (error) {
    //     console.log("Error getting documents: ", error);
    //   });


    const locationsSubscription =  this.db.collection("posts").snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        console.log(data.idUser);
        if (data.idUser == this.authState.uid) {

          return { id, ...data.aboutLocation };
        }

      });
    }).subscribe((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        
        if (doc) {
          
          let newArr = {
            title: doc.city,
            latitude: doc.latitude,
            longitude: doc.longitude,
            svgPath:  that.targetSVG,
            zoomLevel: 3,
            scale: 1,
            color: 'black'
          }
          // Object.setPrototypeOf(newArr, Array(0))
          that.relevantCities.push(newArr);
          this.coloredVisitedCountries.push({
            "id": doc.countryShort, "color": "#febd4a"
          })
          // Array.prototype.push.apply(that.relevantCities, newArr);
          
        }

      });
      locationsSubscription.unsubscribe();
      that.another();
    });
    

  }




}
