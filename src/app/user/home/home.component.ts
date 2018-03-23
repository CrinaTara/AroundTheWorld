import { Component, OnInit, OnDestroy, AfterViewInit  } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from "@angular/router";
import * as firebase from 'firebase';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  authState: any = null;
  private chart: AmChart;

  constructor(private afAuth: AngularFireAuth, private router:Router, private AmCharts: AmChartsService) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
   }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.chart = this.AmCharts.makeChart("chartdiv", {
      "type": "map",
      "theme": "light",
      "dataProvider": {
        "map": "worldLow",
        "getAreasFromMap": true
      },

      "areasSettings": {
        "autoZoom": true,
        "selectedColor": "#CC0000"
      },
      // "titles": [
      //   {
      //     "text": "Chart Title",
      //     "size": 15
      //   }
      // ],

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
            obj.toSVG = function(reviver) {
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
        method: function(event) {
           console.log("Am apasat o data");
        }
    }],
      
    });

    
  }
 
  ngOnDestroy() {
    if (this.chart) {
      this.AmCharts.destroyChart(this.chart);
    }
  }


}
