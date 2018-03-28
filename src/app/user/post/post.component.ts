import { Component, ViewChild, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  // @ViewChild('lgModal') public lgModal: ModalDirective;
  constructor(public postModal : BsModalRef) { }

  ngOnInit() {
   
  }

  // openModal(){
  //   console.log("Merge? AIci?");
  //   this.lgModal.show();
    
  // }

}
