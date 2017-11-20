import { Component } from '@angular/core';

import {
    NavController,
    AlertController,
    LoadingController,
} from 'ionic-angular';

import { Auth } from '../../providers/Auth';

import { HomePage } from '../home/home';

@Component({
    selector: 'page-register',
    templateUrl: 'register.html'
})
export class RegisterPage {

    private username: string = '';
    private email: string = '';
    private password: string = '';
    private password_confirmation: string = '';

    constructor(
        private auth: Auth,
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController
    ) {}

    public submit(): void {

        if (!this.valid()) {
            this.showError('Invalid credentials');
            return;
        }

        let loader = this.loadingCtrl.create();
        loader.present();

        this.auth
            .register(
                this.username,
                this.email,
                this.password
            )
            .then(() => {
                loader.dismiss();
                this.navCtrl.setRoot(HomePage);
            })
            .catch((error: Error) => {
                loader.dismiss();
                this.showError(error.message);
            });

    }

    private valid(): boolean {
        return this.username.length > 0 &&
                this.email.length > 8 &&
                this.password.length > 8 &&
                this.password == this.password_confirmation;
    }

    private showError(message: string) {
        this.alertCtrl.create({
            title: 'Error',
            message: message,
            buttons: ['OK']
        }).present();
    }

}
