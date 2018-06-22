import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.component.html',
  styleUrls: ['./my-trips.component.scss']
})
export class MyTripsComponent implements OnInit {

  authState: any = null;
  weHaveTrips = false;
  allMyTrips = [];

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth, ) {

      this.afAuth.authState.subscribe((auth) => {
        this.authState = auth
      });
  }

  ngOnInit() {
    this.getTrips();
  }

  getTrips(){
    let that = this;
    // this.allMyTrips = [];
    console.log("I am here");
    const unsubscribe = this.db.collection("trips").ref.where("idUser", "==", this.authState.uid).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        console.log("I am ajksd");
        // that.allMyTrips = [];
        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          // that.allMyTrips.push({ id: doc.id, ...doc.data() });
          // that.weHaveTrips = true;
        })
        // console.log(that.allMyTrips);
        unsubscribe();
      });
  
  }

}
