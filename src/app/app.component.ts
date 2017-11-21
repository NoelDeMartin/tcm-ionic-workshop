import { Component } from '@angular/core';

import { Platform }     from 'ionic-angular';
import { StatusBar }    from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { SplashPage }   from '../pages/splash/splash';
import { HomePage }     from '../pages/home/home';
import { LoginPage }    from '../pages/login/login';

import { Auth }     from '../providers/Auth';
import { Backend }  from '../providers/Backend';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {

    rootPage: any = SplashPage;

    constructor(
        auth: Auth,
        backend: Backend,
        platform: Platform,
        statusBar: StatusBar,
        splashScreen: SplashScreen
    ) {

        // Init backend & auth services before starting the application.
        backend
            .init()
            .then(() => {
                return auth.init();
            })
            .then(() => {
                // SplashPage will be active until both of those services are loaded
                // and depending on the status of the user (logged in or not), the
                // first screen will HomePage or LoginPage.
                this.rootPage = auth.isLoggedIn()? HomePage : LoginPage;
            });

        // Once the platform is fully booted (this means the native application with
        // cordova environment), native APIs and plugins will be available.
        platform.ready().then(() => {
            statusBar.styleDefault();
            splashScreen.hide();
        });

    }

}