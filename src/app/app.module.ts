import {
    Injector,
    NgModule,
    ErrorHandler,
    APP_INITIALIZER,
}                         from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import {
    IonicApp,
    IonicErrorHandler,
    IonicModule
}                       from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar }    from '@ionic-native/status-bar';

import { HomePage }     from '../pages/home/home';
import { LoginPage }    from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';

import { Page } from '../components/page/page';

import { Auth }             from '../providers/Auth';
import { Backend }          from '../providers/Backend';
import { FirebaseBackend }  from '../providers/FirebaseBackend';
import { OfflineBackend }   from '../providers/OfflineBackend';

import { registerInjector } from '../utils/injector';

import { MyApp } from './app.component';

let useOfflineBackend: boolean = true;

@NgModule({
    declarations: [
        Page,
        MyApp,
        HomePage,
        LoginPage,
        RegisterPage,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        Page,
        MyApp,
        HomePage,
        LoginPage,
        RegisterPage,
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: registerInjector, deps: [Injector], multi: true },
        Auth,
        StatusBar,
        SplashScreen,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        { provide: Backend, useClass: useOfflineBackend? OfflineBackend : FirebaseBackend }
    ]
})
export class AppModule {}
