import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

    constructor(private authService: AuthService, private router: Router) {
    }

    ngOnInit() {
    }

    public get loggedin() {
        return this.authService.loggedin;
    }

    public navigateTo(address: string): void {
        this.router.navigate([address]);
    }

    public handleLogout(): void {
        this.authService.ticket = '';
    }
}
