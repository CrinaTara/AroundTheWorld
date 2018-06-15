import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class SharedDataService {

  constructor(private db: AngularFirestore) { }

  allMyPosts = [];

  getMyPosts = function (idParam) {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    console.log(idParam);
    let that = this;
    const unsubscribe = this.db.collection("posts").ref.where("idUser", "==", idParam).orderBy("creationDate", "desc").orderBy("creationHour", "desc")
      .onSnapshot(function (querySnapshot) {
        console.log("BBBBBBBBBBBBBBBBBBBB");

        querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          that.allMyPosts.push({ id: doc.id, ...doc.data() });
          // that.weHavePosts = true;
        })
        console.log(that.allMyPosts);
        unsubscribe();
        // return that.allMyPosts;
      });
      return unsubscribe;

  }

}
