import { Injectable } from '@angular/core';

import { Store } from './store';

@Injectable()
export class LocalStorageService {
    constructor() {
    }

    public requestContainerFor(base: string): Store {
        return new Store(base, localStorage);
    }
}
