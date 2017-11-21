import { Component } from '@angular/core';

import { NavController }    from 'ionic-angular';

import { Auth } from '../../providers/Auth';

import UI   from '../../utils/UI';

import { HomePage }     from '../home/home';
import { RegisterPage } from '../register/register';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginPage {

    email: string = '';
    password: string = '';

    constructor(
        private auth: Auth,
        private navCtrl: NavController
    ) {}

    public submit(): void {
        UI.asyncOperation(
            this.auth
                .login(this.email, this.password)
                .then(() => {
                    this.navCtrl.setRoot(HomePage);
                })
        );
    }

    public register(): void {
        this.navCtrl.push(RegisterPage);
    }

}
