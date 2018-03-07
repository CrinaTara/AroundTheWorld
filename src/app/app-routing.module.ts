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


const routes: Routes = [
    {path: '', component: LandingComponent},
    {path: 'sign-in', component: SignInComponent},
    {path: 'sign-up', component: SignUpComponent},
    {path: 'home', component: DashboardComponent,
    children: [
        {path: '', component: HomeComponent},
        {path: 'user-profile', component: UserProfileComponent},
        {path: 'edit-profile', component: EditProfileComponent}
    ]},
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
                                  ];
   
