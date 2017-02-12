import { Injectable } from '@angular/core';

@Injectable()
export class TimeService {
    constructor() {
    }

    public setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]) {
        return setTimeout((...nestedArgs: any[]) => {
            callback(...nestedArgs);
        }, ms, ...args);
    }

    public clearTimeout(id: any) {
        clearTimeout(id);
    }

    public setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]) {
        return setInterval((...nestedArgs: any[]) => {
            callback(...nestedArgs);
        }, ms, ...args);
    }

    public clearInterval(id: any) {
        return clearInterval(id);
    }
}
