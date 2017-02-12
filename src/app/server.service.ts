import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs/Rx';

import { Logger } from 'angular2-logger/core';

import { Store } from './store';
import { TimeService } from './time.service';
import { ConnectionFailureReason, SocketService } from './socket.service';
import { LocalStorageService } from './local-storage.service';
import { ConfigurationService } from './configuration.service';
import { SessionStorageService } from './session-storage.service';


@Injectable()
export class ServerService {
    private observable: Observable<void>;

    private _username: string = '';
    public get username() {
        return this._username;
    }

    private _connected: boolean = false;
    public get connected() {
        return this._connected;
    }

    private _connecting: boolean = false;
    public get connecting() {
        return this._connecting;
    }

    constructor(
        private configurationService: ConfigurationService,

        private logger: Logger,
        private authService: AuthService,
        private timeService: TimeService,
        private socketService: SocketService
    ) {
        this.socketService.onDisconnect().subscribe(() => this.handleSocketDisconnect());
        this.reconnect();
    }

    private validateConnectionStatus() {
        if (this.connected) {
            throw new Error('Server service already launched');
        }

        if (this._connecting) {
            throw new Error('Server service already launching');
        }
    }


    public login(username: string, password: string, expiresOn = Date.now() + this.configurationService.socket.request.timeout) {
        this.validateConnectionStatus();

        return this.socketService.login(username, password, expiresOn).then(
            (token) => this.handleConnectionSuccess(username, token),
            (reason) => this.handleConnectionFailure(reason)
        );
    }

    public logout() {
        if (this._connected) {
            this.socketService.disconnect();
        }

        this._connected = false;
        this._connecting = false;

        this.authService.logout();
    }

    public reconnect(expiresOn = Date.now() + this.configurationService.socket.request.timeout) {
        this.logger.debug('ServerService     | Trying to reconnect');

        this.validateConnectionStatus();

        this._connecting = true;

        let { ticket, username } = <{ ticket: string, username: string }>this.authService;

        if (ticket && username) {
            this.logger.debug('ServerService     | ticket found, trying to connect');
            return this.socketService.connect(ticket, expiresOn).then(
                (token) => this.handleConnectionSuccess(username, token),
                (reason) => this.handleConnectionFailure(reason)
            );
        } else {
            this.logger.debug('ServerService     | Ticket not found, unable to reconnect, waiting for user to login');

            this._connected = false;
            this._connecting = false;

            return Promise.resolve(null);
        }
    }

    private scheduleReconnect() {
        this.timeService.setTimeout(() => this.reconnect(), this.configurationService.socket.request.reconnectInterval);
    }

    private handleConnectionSuccess(username: string, ticket: string) {
        this.logger.debug('ServerService     | Connection successful');

        this._connected = true;
        this._connecting = false;

        this.authService.login(username, ticket);
    }

    private handleConnectionFailure(reason: ConnectionFailureReason) {
        this.logger.debug('ServerService     | Connection failure, reason:', reason);

        this._connected = false;
        this._connecting = false;

        this.authService.logout();

        // TODO: Check all possible reasons and reconnect when appropriate
        if (reason > ConnectionFailureReason.ConnectionError) {
            this.logger.debug('ServerService     | Scheduling reconnect', reason);

            this.scheduleReconnect();
        }
    }

    private handleSocketDisconnect() {
        this.logger.debug('ServerService     | Socket disconnected');

        if (this.connected) {
            this.logger.debug('ServerService     | Scheduling reconnect');
            this.timeService.setTimeout(() => this.reconnect(), this.configurationService.socket.request.reconnectInterval);
        } else {
            this.logger.debug('ServerService     | ');
        }

        this._connected = false;
        this._connecting = false;
    }
}
