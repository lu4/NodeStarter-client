import { ServerService } from './server.service';
import { Component } from '@angular/core';
import { SocketService } from './socket.service';

import { Logger, Level } from 'angular2-logger/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    public constructor(private server: ServerService) {
    }
}
