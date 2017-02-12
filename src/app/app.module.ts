import 'rxjs';

import { NgModule } from '@angular/core';
import { isDevMode } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { Logger, Level } from 'angular2-logger/core';

import { ViewService } from './view.service';
import { UuidService } from './uuid.service';
import { AuthService } from './auth.service';
import { TimeService } from './time.service';
import { SocketService } from './socket.service';
import { ServerService } from './server.service';
import { WindowService } from './window.service';
import { AuthGuardService } from './auth-guard.service';
import { LocalStorageService } from './local-storage.service';
import { ConfigurationService } from './configuration.service';
import { SessionStorageService } from './session-storage.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { LandingComponent } from './landing/landing.component';
import { RegistrationComponent } from './registration/registration.component';
import { ViewComponent } from './view/view.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        RegistrationComponent,
        HomeComponent,
        LandingComponent,
        ViewComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot([{
            path: '',
            pathMatch: 'full',
            redirectTo: '/landing'
        }, {
            path: 'login',
            component: LoginComponent
        }, {
            path: 'landing',
            component: LandingComponent
        }, {
            path: 'register',
            component: RegistrationComponent
        }, {
            path: 'view/:id',
            component: ViewComponent,
            canActivate: [AuthGuardService],
            children: [{
                path: 'home',
                component: HomeComponent,
                canActivate: [AuthGuardService]
            // }, {
            //     path: 'search',
            //     component: SearchComponent,
            //     canActivate: [AuthGuardService]
            }]
        }])
    ],
    providers: [
        Logger,
        AuthService,
        UuidService,
        TimeService,
        ViewService,
        SocketService,
        WindowService,
        ServerService,
        AuthGuardService,
        LocalStorageService,
        ConfigurationService,
        SessionStorageService,

        { provide: 'Window', useValue: window },
        { provide: LocationStrategy, useClass: HashLocationStrategy }

    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    public constructor(private logger: Logger) {
        if (isDevMode()) {
            logger.level = Level.DEBUG;
        }
    }
}
