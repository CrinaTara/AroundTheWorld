import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from './../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { routingComponents } from './app-routing.module';
import { AuthGuard } from './auth-guard.service';
import { BsDropdownModule } from 'ngx-bootstrap';
import { AmChartsModule } from "@amcharts/amcharts3-angular";
import { ModalModule } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-bootstrap';
import { TypeaheadModule } from 'ngx-bootstrap';

import 'hammerjs';
import 'mousetrap';
import { ModalGalleryModule } from 'angular-modal-gallery';
import { PostComponent } from './user/post/post.component';
import { SharedDataService } from './shared-data.service';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    PostComponent, 
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyBREOM7Dc_EXXURYNYg1zQ4xg3TWoJK-QI",
      libraries: ["places"]
    }),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    AmChartsModule,
    ModalModule.forRoot(),
    CarouselModule.forRoot(),
    ModalGalleryModule.forRoot(),
    TypeaheadModule.forRoot(),
  ],
  providers: [AuthGuard, SharedDataService],
  bootstrap: [AppComponent],
  entryComponents: [
    PostComponent
]
})
export class AppModule { }
