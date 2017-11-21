import { Injectable } from '@angular/core';

import moment   from 'moment';

import { Observable }   from 'rxjs/Observable';
import { BehaviorSubject }  from 'rxjs/BehaviorSubject';

import { User }     from '../models/User';
import { Room }     from '../models/Room';
import { Message }  from '../models/Message';

import { Backend }  from './Backend';

@Injectable()
export class OfflineBackend extends Backend {

    private user: User = null;
    private roomsSubject: BehaviorSubject<Room[]> = new BehaviorSubject([]);

    public init(): Promise<void> {

        // Use this to generate stubs

        this.user = this.createUserStub();

        let john = this.createUserStub('John Doe');

        this.createRoom(this.user, 'Welcome!', [john.authId])
            .then((room: Room) => {
                this.sendMessage(room, john, 'Hi there I am jhon');
                this.sendMessage(room, this.user, 'Hi there I am guest');
            });

        return Promise.resolve();
    }

    public getCurrentUser(): Promise<User | null> {
        return Promise.resolve(this.user);
    }

    public login(email: string, password: string): Promise<User> {
        return Promise.resolve(this.user = this.createUserStub());
    }

    public register(username: string, email: string, password: string): Promise<User> {
        return Promise.resolve(this.user = this.createUserStub(username));
    }

    public findUsersByUsername(usernames: string[]): Promise<User[]> {
        return Promise.resolve([]);
    }

    public createRoom(user: User, topic: string, members: string[]): Promise<Room> {
        let room = this.createRoomStub(topic, members);
        this.roomsSubject.next(this.roomsSubject.value.concat([room]));
        return Promise.resolve(room);
    }

    public sendMessage(room: Room, author: User, text: string): Promise<void> {
        room.addMessage(this.createMessageStub(author, text));
        return Promise.resolve();
    }

    public observeUserRooms(user: User): Observable<Room[]> {
        return this.roomsSubject.asObservable();
    }

    public unsubscribeRoomsObservable(roomsObservable: Observable<Room[]>): void {
        // nothing to do here
    }

    private generateId(): string {
        return (Math.random() * 100000).toString();
    }

    private createUserStub(username: string = 'guest'): User {
        return new User(this.generateId(), this.generateId(), username);
    }

    private createRoomStub(topic: string, members: string[] = []): Room {
        return new Room(this.generateId(), topic, moment(), members);
    }

    private createMessageStub(author: User, text: string): Message {
        return new Message(this.generateId(), author, text, moment());
    }

}
