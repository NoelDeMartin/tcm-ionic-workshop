import { Component }    from '@angular/core';

import { NavParams } from 'ionic-angular';

import { Room } from '../../models/Room';

@Component({
    selector: 'page-room',
    templateUrl: 'room.html'
})
export class RoomPage {

    room: Room;

    message: string = '';

    constructor(params: NavParams) {
        this.room = params.get('room');
    }

    public sendMessage(): void {
        // TODO
    }

}