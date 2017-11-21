import { Component } from '@angular/core';

import { NavController }    from 'ionic-angular';

import { Auth } from '../../providers/Auth';

import UI   from '../../utils/UI';

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
        private navCtrl: NavController
    ) {}

    public submit(): void {

        if (!this.valid()) {
            UI.showError('Invalid credentials');
            return;
        }

        UI.asyncOperation(
            this.auth
                .register(
                    this.username,
                    this.email,
                    this.password
                )
                .then(() => {
                    this.navCtrl.setRoot(HomePage);
                })
        );

    }

    private valid(): boolean {
        return this.username.length > 0 &&
                this.email.length > 8 &&
                this.password.length > 8 &&
                this.password == this.password_confirmation;
    }

}
