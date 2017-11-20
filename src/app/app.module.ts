import {
  NgModule,
  ErrorHandler,
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

import { Auth }             from '../providers/Auth';
import { Backend }          from '../providers/Backend';
import { FirebaseBackend }  from '../providers/FirebaseBackend';
import { OfflineBackend }   from '../providers/OfflineBackend';

import { MyApp } from './app.component';

let useOfflineBackend: boolean = true;

@NgModule({
    declarations: [
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
        MyApp,
        HomePage,
        LoginPage,
        RegisterPage,
    ],
    providers: [
        Auth,
        StatusBar,
        SplashScreen,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        { provide: Backend, useClass: useOfflineBackend? OfflineBackend : FirebaseBackend }
    ]
})
export class AppModule {}
