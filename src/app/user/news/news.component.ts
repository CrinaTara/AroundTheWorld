import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  authState: any = null;

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) { 
    // Nu stiu daca am ELEMENT_PROBE_PROVIDERS. Poate o sa sterg asta
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {
    this.getNewestPosts();
  }

  getNewestPosts(){
    let first = this.db.collection("posts").ref
        .orderBy("creationDate")
        .limit(3);
    console.log("Here is first: ");
    console.log(first);
    let that = this;
    return first.get().then(function (documentSnapshots) {
      // Get the last visible document
      var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
      console.log("last", lastVisible);

      // Construct a new query starting at this document,
      // get the next 25 cities.
      var next = that.db.collection("posts").ref
              .orderBy("creationDate")
              .startAfter(lastVisible)
              .limit(3);
      console.log("Here is next: ");
      console.log(next);               
    });
  }

}
