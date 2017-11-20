import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
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

        backend
            .init()
            .then(() => {
                return auth.init();
            })
            .then(() => {
                this.rootPage = auth.isLoggedIn()? HomePage : LoginPage;
            });

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();
        });

    }

}

