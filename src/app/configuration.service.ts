import { Injectable } from '@angular/core';

@Injectable()
export class ConfigurationService {
    public socket = {
        request: {
            timeout: 1000 /* milliseconds */,
            reconnectInterval: 5000
        },
        garbageCollection: {
            resolution: 1000 /* milliseconds */
        },
    };

    public workspace = {
        dirtyCheckInterval: 500, /* milliseconds */
        dirtyCheckInitialDelay: 500 /* milliseconds */
    };
}
