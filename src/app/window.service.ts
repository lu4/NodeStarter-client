import { Component, Injectable, Inject } from '@angular/core';

@Injectable()
export class WindowService {
    public constructor(@Inject('Window') private _nativeWindow: Window) {

    }

    public get nativeWindow(): Window {
        return this._nativeWindow;
    }
}
