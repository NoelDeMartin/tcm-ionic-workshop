import {
    Component,
    ViewChild,
    ElementRef,
} from '@angular/core';

import { NavParams } from 'ionic-angular';

import { Chat } from '../../providers/Chat';
import { Auth } from '../../providers/Auth';

import { User }     from '../../models/User';
import { Message }  from '../../models/Message';
import {
    Room,
    RoomListener,
} from '../../models/Room';

import UI   from '../../utils/UI';

@Component({
    selector: 'page-room',
    templateUrl: 'room.html'
})
export class RoomPage implements RoomListener {

    @ViewChild('messages') messages: ElementRef;

    user: User;
    room: Room;

    message: string = '';

    constructor(
        private chat: Chat,
        auth: Auth,
        params: NavParams
    ) {
        this.user = auth.getUser();
        this.room = params.get('room');
    }

    ionViewDidEnter() {
        this.room.addListener(this);
        this.scrollToBottom();
    }

    ionViewDidLeave() {
        this.room.removeListener(this);
    }

    public sendMessage(): void {
        this.chat.sendMessage(this.room, this.message);
        this.message = '';
    }

    public onNewMessage(message: Message): void {
        UI.nextTick(this.scrollToBottom.bind(this));
    }

    private scrollToBottom(): void {

        let element = this.messages.nativeElement;

        if (isDivElement(element)) {
            let scroll: HTMLElement = element.parentElement;
            UI.animate(scroll, 'scrollTop', scroll.scrollHeight - scroll.clientHeight, 300);
        }

    }

}

function isDivElement(object: any): object is HTMLDivElement {
    return object instanceof HTMLDivElement;
}