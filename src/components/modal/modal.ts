import {
    Input,
    Component,
} from '@angular/core';

import { ViewController }   from 'ionic-angular';

/**
 * Modal component, to be used for the common layout of any modal.
 */
@Component({
    selector: 'modal',
    templateUrl: 'modal.html'
})
export class Modal {

    @Input() title;

    constructor(private viewCtrl: ViewController) {}

    public close(): void {
        this.viewCtrl.dismiss();
    }

}