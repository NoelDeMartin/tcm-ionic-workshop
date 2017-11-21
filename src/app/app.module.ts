import {
    Injector,
    NgModule,
    ErrorHandler,
    APP_INITIALIZER,
}                         from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import {
    IonicApp,
    IonicModule,
    IonicErrorHandler,
}                       from 'ionic-angular';
import { StatusBar }    from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage }     from '../pages/home/home';
import { RoomPage }     from '../pages/room/room';
import { LoginPage }    from '../pages/login/login';
import { SplashPage }   from '../pages/splash/splash';
import { RegisterPage } from '../pages/register/register';

import { CreateRoomModal }  from '../modals/create-room/create-room';

import {
    Page,
    OptionsMenu,
}                   from '../components/page/page';
import { Modal }    from '../components/modal/modal';

import { Auth }             from '../providers/Auth';
import { Chat }             from '../providers/Chat';
import { Backend }          from '../providers/Backend';
import { FirebaseBackend }  from '../providers/FirebaseBackend';
import { OfflineBackend }   from '../providers/OfflineBackend';

import { registerInjector } from '../utils/injector';

import { MyApp } from './app.component';

let useOfflineBackend: boolean = false;

@NgModule({
    declarations: [
        Page,
        Modal,
        MyApp,
        HomePage,
        RoomPage,
        LoginPage,
        SplashPage,
        OptionsMenu,
        RegisterPage,
        CreateRoomModal,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        Page,
        Modal,
        MyApp,
        RoomPage,
        HomePage,
        LoginPage,
        SplashPage,
        OptionsMenu,
        RegisterPage,
        CreateRoomModal,
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: registerInjector, deps: [Injector], multi: true },
        Auth,
        Chat,
        StatusBar,
        SplashScreen,
        { provide: ErrorHandler, useClass: IonicErrorHandler },

        // Backend implementation can be changed using dependency injection,
        // try using OfflineBackend for an offline implementation with stubs.
        { provide: Backend, useClass: useOfflineBackend? OfflineBackend : FirebaseBackend }

    ]
})
export class AppModule {}
