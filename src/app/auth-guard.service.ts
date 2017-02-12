import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.authService.ticket) { return true; }

        // Store the attempted URL for redirecting
        this.authService.redirectUrl = state.url;

        // Navigate to the login page
        this.router.navigate(['/']);

        return false;
    }
}
