import { Injectable } from '@angular/core';

import { Store } from './store';

@Injectable()
export class SessionStorageService {
    constructor() {
    }

    public requestContainerFor(base: string): Store {
        return new Store(base, sessionStorage);
    }
}
