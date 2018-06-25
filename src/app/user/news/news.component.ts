import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Image } from 'angular-modal-gallery';
import * as moment from 'moment';
@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  authState: any = null;

  listPosts: any = [];
  postsILiked = [];
  weHavePosts: boolean = false;

  public userObject: any;
  public userObjectRetrived: any;

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) { 
    // Nu stiu daca am ELEMENT_PROBE_PROVIDERS. Poate o sa sterg asta
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  ngOnInit() {

    this.userObjectRetrived = localStorage.getItem('User');
    this.userObject = JSON.parse(this.userObjectRetrived);

    this.getNewestPosts();
  }

  getNewestPosts(){
    // let first = this.db.collection("posts").ref
    //     .orderBy("creationDate")
    //     .limit(3);
    // console.log("Here is first: ");
    // console.log(first);
    // let that = this;
    // return first.get().then(function (documentSnapshots) {
    //   // Get the last visible document
    //   var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
    //   console.log("last", lastVisible);

    //   // Construct a new query starting at this document,
    //   // get the next 25 cities.
    //   var next = that.db.collection("posts").ref
    //           .orderBy("creationDate")
    //           .startAfter(lastVisible)
    //           .limit(3);
    //   console.log("Here is next: ");
    //   console.log(next);               
    // });
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
          // unsubscribe();
        })
        console.log(that.listPosts);
      });
  }

}
