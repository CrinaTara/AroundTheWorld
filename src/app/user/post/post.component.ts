import { Component, ViewChild, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ModalDirective } from 'ngx-bootstrap';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  tripForm: FormGroup;
  postForm:FormGroup;

  public showNewTrip: boolean = true;
  public showNewPost: boolean = false;

  constructor(public postModal : BsModalRef,  public fb: FormBuilder,) { }

  ngOnInit() {
    this.tripForm = this.fb.group({
      //trip name, trip user, creation date
      tripName: ['', Validators.required],
      tripDetails: ['']
    }),
    this.postForm = this.fb.group({
      //trip id, id user, post id, date
      location: ['', Validators.required],
      postName: ['', Validators.required],
      postDetails: ['', Validators.required],
      privacy: ['', Validators.required]
    })
  }

  createTrip(){
    this.showNewPost = true;
    this.showNewTrip = false;
  }

  newTrip(){
    this.showNewPost = false;
    this.showNewTrip = true;
  }
}
