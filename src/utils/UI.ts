import {
    Loading,
    AlertController,
    ModalController,
    LoadingController,
} from 'ionic-angular';

import { resolveDependency }    from './injector';

class UI {

    private loader: Loading;
    private alertCtrl: AlertController;
    private modalCtrl: ModalController;
    private loadingCtrl: LoadingController;

    asyncOperation(promise: Promise<any>): Promise<any> {

        this.showLoading();

        return promise
            .then(() => {
                this.hideLoading();
            })
            .catch((error: any) => {
                this.hideLoading();
                if (error instanceof Error) {
                    this.showError(error.message);
                } else {
                    this.showError('Unknown error');
                }
            });
    }

    public showLoading(): void {

        if (!this.loadingCtrl) {
            this.loadingCtrl = resolveDependency(LoadingController);
        }

        if (this.loader) {
            this.loader.dismiss();
        }

        this.loader = this.loadingCtrl.create();
        this.loader.present();

    }

    public hideLoading(): void {
        if (this.loader) {
            this.loader.dismiss();
            this.loader = null;
        }
    }

    public showError(message: string): void {

        if (!this.alertCtrl) {
            this.alertCtrl = resolveDependency(AlertController);
        }

        this.alertCtrl.create({
            title: 'Error',
            message: message,
            buttons: ['OK']
        }).present();

    }

    public showModal(modal: any): void {

        if (!this.modalCtrl) {
            this.modalCtrl = resolveDependency(ModalController);
        }

        this.modalCtrl.create(modal).present();

    }

}

export default new UI();