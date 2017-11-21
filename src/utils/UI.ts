import {
    Loading,
    AlertController,
    ModalController,
    LoadingController,
} from 'ionic-angular';

import { resolveDependency }    from './injector';

/**
 * This class will act as a singleton with common UI patterns used throughout
 * the app.
 *
 * This approach is an alternative to using providers, and although it removes
 * some of the flexibility of using providers, it adds the convenience of being
 * imported and used directly, instead of being injected into a class with all
 * the writing that involves.
 */
class UI {

    private loader: Loading;
    private alertCtrl: AlertController;
    private modalCtrl: ModalController;
    private loadingCtrl: LoadingController;

    /**
     * This is used to wrap any async operation which needs to block the
     * UI with a loader.
     */
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

    /**
     * Run some code after Angular's change detection. This is important
     * if any actions needs to directly manipulate DOM state.
     *
     * More information about angular's tick: https://angular.io/api/core/ApplicationRef#!#tick-anchor
     */
    public nextTick(callback: Function): void {
        setTimeout(callback, 0);
    }

    /**
     * There are multiple libraries available to animate properties in different ways,
     * but sometimes a simple implementation such as this can get the job done.
     */
    public animate(
        object: any,
        property: string,
        targetValue: number,
        duration: number = 1000
    ): void {

        let startValue: number = object[property];
        let start: number = Date.now();

        let animationRenderFrame = () => {

            let progress = Math.min((Date.now() - start) / duration, 1);
            object[property] = startValue + (targetValue - startValue) * progress;

            if (progress < 1) window.requestAnimationFrame(animationRenderFrame);

        };

        window.requestAnimationFrame(animationRenderFrame);

    }

}

export default new UI();