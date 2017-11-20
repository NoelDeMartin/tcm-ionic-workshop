import { Component } from '@angular/core';

import {
    NavController,
    AlertController,
    LoadingController,
} from 'ionic-angular';

import { Auth } from '../../providers/Auth';

import { HomePage } from '../home/home';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginPage {

    email: string = '';
    password: string = '';

    constructor(
        private auth: Auth,
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController
    ) {}

    public submit(): void {

        let loader = this.loadingCtrl.create();
        loader.present();

        this.auth
            .login(this.email, this.password)
            .then(() => {
                loader.dismiss();
                this.navCtrl.setRoot(HomePage);
            })
            .catch((error: Error) => {
                loader.dismiss();
                this.showError(error.message);
            });

    }

    public register(): void {
        // this.navCtrl.push(RegisterPage);
    }

    private showError(message: string) {
        this.alertCtrl.create({
            title: 'Error',
            message: message,
            buttons: ['OK']
        }).present();
    }

}
