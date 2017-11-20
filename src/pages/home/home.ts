import { Component }    from '@angular/core';

import { NavController }    from 'ionic-angular';

import UI   from '../../utils/UI';

import { CreateRoomModal }  from '../../modals/create-room/create-room';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    constructor(public navCtrl: NavController) {}

    public createRoom(): void {
        UI.showModal(CreateRoomModal);
    }

}
