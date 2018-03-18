import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';

@Injectable() 
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(private router: Router) {}
    canActivate() {
        if (localStorage.getItem('Auth')) {
            console.log("You are authorized");
            return true;
        } else {
            console.log("You are not authorized");
            this.router.navigate(['/sign-in'])
            return false;
        }
    }

    canActivateChild() {
        if (localStorage.getItem('Auth')) {
            console.log("You are authorized");
            return true;
        } else {
            console.log("You are not authorized");
            this.router.navigate(['/sign-in'])
            return false;
        }
    }
}