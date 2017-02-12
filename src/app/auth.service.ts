import 'rxjs/add/operator/toPromise';

import { Store } from './store';
import { SessionStorageService } from './session-storage.service';

import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';


@Injectable()
export class AuthService {
    // Store the URL so we can redirect after logging in
    public redirectUrl: string;

    private _ticket: string | null;
    private _username: string | null;

    private _localStorage: Store;

    public constructor(private storageService: SessionStorageService) {
        this._localStorage = storageService.requestContainerFor('AuthService');

        this._ticket = this._localStorage.getItem<string>('ticket');
        this._username = this._localStorage.getItem<string>('username');
    }

    public get loggedin() {
        return this.username && this.ticket;
    }

    public login(username: string, ticket: string) {
        this.ticket = ticket;
        this.username = username;
    }

    public logout(): void {
        this._ticket = null;
        this.username = null;

        this._localStorage.removeItem('ticket');
        this._localStorage.removeItem('username');
    }

    public get ticket(): string | null {
        return this._ticket;
    }

    public set ticket(token: string | null) {
        this._localStorage.setItem('ticket', this._ticket = token);
    }

    public get username(): string | null {
        return this._username;
    }

    public set username(value) {
        this._localStorage.setItem('username', this._username = value);
    }
}
