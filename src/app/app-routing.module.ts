import { NgModule } from '@angular/core';
import { RouterModule, Routes, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './user/home/home.component';
import { TopMenuComponent } from './user/top-menu/top-menu.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { DashboardComponent } from './user/dashboard/dashboard.component';
import { EditProfileComponent } from './user/edit-profile/edit-profile.component';
import { FindFriendsComponent } from './user/find-friends/find-friends.component';
import { SearchDestinationsComponent } from './user/search-destinations/search-destinations.component';
import { NewsComponent } from './user/news/news.component';
import { ViewUserProfileComponent } from './user/view-user-profile/view-user-profile.component';
import { ViewCountryPostsComponent } from './user/view-country-posts/view-country-posts.component';
import { MyTripsComponent } from './user/my-trips/my-trips.component';
import { TripDetailsComponent } from './user/trip-details/trip-details.component';
import { TopMenuAdminComponent } from './admin/top-menu-admin/top-menu-admin.component';
import { UsersListComponent } from './admin/users-list/users-list.component';


import { AuthGuard } from './auth-guard.service';

const routes: Routes = [
    {path: '', component: LandingComponent},
    {path: 'sign-in', component: SignInComponent},
    {path: 'sign-up', component: SignUpComponent},
    {path: 'list-of-users', component: UsersListComponent,  canActivate: [AuthGuard]},
    {path: 'home', component: DashboardComponent,  canActivate: [AuthGuard],
    children: [
        {path: '', component: HomeComponent, canActivateChild: [AuthGuard]},
        {path: 'news', component: NewsComponent, canActivateChild: [AuthGuard]},
        {path: 'user-profile', component: UserProfileComponent, canActivateChild: [AuthGuard]},
        {path: 'edit-profile', component: EditProfileComponent, canActivateChild: [AuthGuard]},
        {path: 'find-friends', component: FindFriendsComponent, canActivateChild: [AuthGuard]},
        {path: 'search-destinations', component: SearchDestinationsComponent, canActivateChild: [AuthGuard]},
        {path: 'my-trips', component: MyTripsComponent, canActivateChild: [AuthGuard]},
    ]},
    {path: 'view-user-profile/:id', component: ViewUserProfileComponent,  canActivate: [AuthGuard]},
    {path: 'view-country/:name', component: ViewCountryPostsComponent,  canActivate: [AuthGuard]},
    {path: 'trip-details/:id', component: TripDetailsComponent,  canActivate: [AuthGuard]},
    {path: '**', component: LandingComponent}
]


@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: true })
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule {

}
export const routingComponents = [LandingComponent,
                                  SignInComponent,
                                  SignUpComponent,
                                  HomeComponent,
                                  TopMenuComponent,
                                  MainMenuComponent,
                                  UserProfileComponent,
                                  DashboardComponent,
                                  EditProfileComponent,  
                                  FindFriendsComponent,
                                  SearchDestinationsComponent,
                                  NewsComponent,
                                  ViewUserProfileComponent,
                                  ViewCountryPostsComponent,
                                  MyTripsComponent,
                                  TripDetailsComponent,
                                  TopMenuAdminComponent,
                                  UsersListComponent,
                                  ];
   
