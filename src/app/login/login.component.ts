import { ViewService } from '../view.service';
import { exec } from 'child_process';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthService } from '../auth.service';
import { ServerService } from '../server.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    public error = false;
    public model = { username: '', password: '' };

    constructor(
        public router: Router,
        public viewService: ViewService,
        public serverService: ServerService
    ) {
    }

    public get connected() {
        return this.serverService.connected;
    }

    public get username() {
        return this.serverService.username;
    }

    public handleLogin(username: string, password: string) {
        this.serverService.login(username, password).then(() => {
            this.viewService.navigate(['home']);
        });
    }

    public handleLogout() {
        this.serverService.logout();
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.model = { username: '', password: '' };
    }
}
