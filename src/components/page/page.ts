import {
    Input,
    Component,
} from '@angular/core';

import {
    Popover,
    NavParams,
    ViewController,
    PopoverController,
} from 'ionic-angular';

type Callable = Function | ((...args: any[]) => any);

export type PageOption = {
    text: string,
    callback: Callable,
};

export type PageAction = {
    icon: string,
    callback: Callable,
};

/**
 * Page component, to be used for the common layout of any page.
 * This also includes parameters to configure toolbar actions.
 */
@Component({
    selector: 'page',
    templateUrl: 'page.html'
})
export class Page {

    @Input() title: string = 'TCMChat';
    @Input() subtitle: string = '';

    @Input() actions: PageAction[] = [];
    @Input() options: PageOption[] = [];

    private optionsMenu: Popover;

    constructor(private popoverCtrl: PopoverController) {}

    public openOptionsMenu(event: Event): void {

        if (!this.optionsMenu) {
            this.optionsMenu = this.popoverCtrl.create(OptionsMenu, {
                options: this.options
            });
        }

        this.optionsMenu.present({
            ev: event
        });

    }

    get hasSubtitle(): boolean {
        return !!this.subtitle;
    }

}

@Component({
    template: `
        <ion-list>
            <button
                *ngFor="let option of options"
                ion-item
                (click)="trigger(option)"
            >
                {{ option.text }}
            </button>
        </ion-list>
    `
})
export class OptionsMenu {

    options: PageOption[] = [];

    constructor(
        private viewCtrl: ViewController,
        navParams: NavParams
    ) {
        this.options = navParams.get('options');
    }

    public trigger(option: PageOption): void {
        this.viewCtrl.dismiss();
        option.callback.call(this);
    }

}