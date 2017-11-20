import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';

import { Backend }  from '../providers/Backend';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

    rootPage:any = LoginPage;

    constructor(
        backend: Backend,
        platform: Platform,
        statusBar: StatusBar,
        splashScreen: SplashScreen
    ) {

        backend.init();

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();
        });

    }

}

