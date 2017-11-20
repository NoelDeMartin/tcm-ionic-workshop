import { Component }    from '@angular/core';

import { ViewController }   from 'ionic-angular';

import { Chat } from '../../providers/Chat';

import UI   from '../../utils/UI';

@Component({
    selector: 'modal-create-room',
    templateUrl: 'create-room.html'
})
export class CreateRoomModal {

    private topic: string = '';
    private members: string[] = [''];

    constructor(
        private chat: Chat,
        private viewCtrl: ViewController
    ) {}

    public submit(): void {
        UI.asyncOperation(
            this.chat
                .createRoom(this.topic, this.members)
                .then(() => {
                    this.viewCtrl.dismiss();
                })
        );
    }

    get memberIndexes(): number[] {
        return Object.keys(this.members).map((key: string) => {
            return parseInt(key);
        });
    }

}