import { Component } from '@angular/core';

import { NavController }    from 'ionic-angular';

import { Observable }   from 'rxjs/Observable';

import { Auth } from '../../providers/Auth';
import { Chat } from '../../providers/Chat';

import UI from '../../utils/UI';

import { Room } from '../../models/Room';

import { CreateRoomModal }  from '../../modals/create-room/create-room';

import {
    PageAction,
    PageOption,
}   from '../../components/page/page';

import { LoginPage }    from '../login/login';
import { RoomPage }     from '../room/room';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    roomsObservable: Observable<Room[]>;

    actions: PageAction[] = [];
    options: PageOption[] = [];

    constructor(
        private auth: Auth,
        private navCtrl: NavController,
        chat: Chat
    ) {

        this.roomsObservable = chat.getRoomsObservable();

        this.actions.push({
            icon: 'add',
            callback: this.createRoom.bind(this)
        });

        this.options.push({
            text: 'Logout',
            callback: this.logout.bind(this)
        });

    }

    public createRoom(): void {
        UI.showModal(CreateRoomModal);
    }

    public openRoom(room: Room): void {
        this.navCtrl.push(RoomPage, { room: room });
    }

    public logout(): void {
        UI.asyncOperation(
            this.auth
                .logout()
                .then(() => {
                    this.navCtrl.setRoot(LoginPage);
                })
        );
    }

}
