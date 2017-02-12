import { ConfigurationService } from './configuration.service';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UuidService } from './uuid.service';
import { WindowService } from './window.service';
import { NavigationExtras, Router } from '@angular/router';

@Injectable()
export class ViewService {
    private readonly datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    private _id: string | null = null;
    private _container: Object = {};
    private _sessionStorage: Storage;
    private _containerJson: string  | null = '{}';


    private persistIfChanged() {
        let json = JSON.stringify(this._container);

        if (this._id && this._containerJson !== json) {
            this._sessionStorage.setItem(this._id, this._containerJson = json);
        }
    }

    constructor(
        private router: Router,
        private authService: AuthService,
        private uuidService: UuidService,
        private windowService: WindowService,
        private configurationService: ConfigurationService
    ) {
        this._sessionStorage = this.windowService.nativeWindow.sessionStorage;

        Observable.timer(
            this.configurationService.workspace.dirtyCheckInitialDelay,
            this.configurationService.workspace.dirtyCheckInterval
        ).forEach(() => {
            this.persistIfChanged();
        });
    }

    public get id(): string | null {
        return this._id;
    }

    public set id(id: string | null) {
        let toString = Object.prototype.toString;

        if (id) {
            this._container = JSON.parse(
                (this._containerJson = this._sessionStorage.getItem(this._id = id)) || (this._containerJson = '{}'),

                (key: any, value: any) => {
                    if (toString.call(value) === '[object String]' && this.datePattern.test(value)) {
                        return new Date(value);
                    }

                    return value;
                }
            );
        }
    }

    public workspace<T>(key: string, factory: () => T): T {
        if (this._container[key]) {
            return this._container[key];
        } else {
            return this._container[key] = (factory && factory() || { });
        }
    }

    public navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
        this.persistIfChanged();

        if (
            commands &&
            commands.length &&
            commands[0] === '/login' ||
            (typeof commands[0] === 'string' && (<string>commands[0]).startsWith('/login'))
        ) {
            return this.router.navigate(commands, extras);
        } else {
            return this.router.navigate(['/view', this.uuidService.generate(), ...commands], extras);
        }
    }

    public logout(commands: any[] = ['/login'], extras?: NavigationExtras) {
        this.navigate(commands, extras);
        this.authService.logout();
    }
}
