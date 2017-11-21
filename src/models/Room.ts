import { Moment }   from 'moment';

import { Message }  from './Message';

export class Room {

    public readonly id: string;
    public readonly topic: string;
    public readonly lastActiveAt: Moment;
    public readonly memberIds: string[];
    public readonly messages: Message[];

    private listeners: RoomListener[] = [];

    constructor(id: string, topic: string, lastActiveAt: Moment, memberIds: string[]) {
        this.id = id;
        this.topic = topic;
        this.lastActiveAt = lastActiveAt;
        this.memberIds = memberIds;
        this.messages = [];
    }

    public addListener(listener: RoomListener): void {
        this.listeners.push(listener);
    }

    public removeListener(listener: RoomListener): void {

        let index = this.listeners.indexOf(listener);

        if (index !== -1) {
            this.listeners.splice(index, 1);
        }

    }

    public addMember(id: string): void {
        if (this.memberIds.indexOf(id) === -1) {
            this.memberIds.push(id);
        }
    }

    public addMessage(message: Message): void {

        let messageIds = this.messages.map((message: Message) => {
            return message.id;
        });

        let messageIndex = messageIds.indexOf(message.id);

        if (messageIndex === -1) {

            this.messages.push(message);

            for (let listener of this.listeners) {
                listener.onNewMessage(message);
            }

        } else {
            this.messages.splice(messageIndex, 1, message);
        }

        this.messages.sort((a: Message, b: Message) => {
            return a.date > b.date? 1 : -1;
        });

    }

    public removeMessage(id: string): void {

        let messageIds = this.messages.map((message: Message) => {
            return message.id;
        });

        let messageIndex = messageIds.indexOf(id);

        if (messageIndex !== -1) {
            this.messages.splice(messageIndex, 1);
        }

    }

}

export interface RoomListener {

    onNewMessage(message: Message): void;

}
