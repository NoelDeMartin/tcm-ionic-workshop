import { Injectable }   from '@angular/core';

import { Observable }       from 'rxjs/Observable';
import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
import { Subscription }     from 'rxjs/Subscription';

import { User } from '../models/User';
import { Room } from '../models/Room';

import {
    Auth,
    AuthListener,
}                   from './Auth';
import { Backend }  from './Backend';

@Injectable()
export class Chat implements AuthListener {

    private roomsSubject: BehaviorSubject<Room[]> = new BehaviorSubject([]);
    private roomsSubscription: Subscription = null;

    constructor(private backend: Backend, private auth: Auth) {
        auth.addListener(this);
        this.onUserUpdated(this.auth.getUser());
    }

    public getRoomsObservable(): Observable<Room[]> {
        return this.roomsSubject.asObservable();
    }

    public createRoom(topic: string, memberUsernames: string[]): Promise<Room> {

        if (!this.auth.isLoggedIn()) return Promise.reject(new Error('User not authenticated'));

        return this
            .prepareRoomMembers(memberUsernames)
            .then((members: string[]) => {
                return this.backend.createRoom(this.auth.getUser(), topic, members);
            });
    }

    public sendMessage(room: Room, message: string): Promise<void> {

        if (!this.auth.isLoggedIn()) return Promise.reject(new Error('User not authenticated'));

        return this.backend.sendMessage(room, this.auth.getUser(), message);
    }

    public onUserUpdated(user: User | null): void {

        if (this.roomsSubscription) {

            this.roomsSubscription.unsubscribe();
            this.roomsSubscription = null;

            // TODO there is a memory leak here, even thou we have unsubscribed from the
            // observable, Firebase is still listening for changes on the previous conditions.
            // Keep that in mind for a production app.

        }

        if (user) {

            this.roomsSubscription =
                this.backend
                    .observeUserRooms(user)
                    .subscribe((rooms: Room[]) => {
                        this.roomsSubject.next(rooms);
                    });

        } else {
            this.roomsSubject.next([]);
        }

    }

    private prepareRoomMembers(usernames: string[]): Promise<string[]> {

        // Remove duplicates
        let uniqueUsernames = [];
        for (let username of usernames) {
            if (uniqueUsernames.indexOf(username) === -1) {
                uniqueUsernames.push(username);
            }
        }
        usernames = uniqueUsernames;

        return this
            .backend.findUsersByUsername(usernames)
            .then((members: User[]) => {

                // We are using authId to validate users instead of id in order to provide
                // server-side permissions using Firebase Auth

                let memberIds: string[] = members.map((member: User) => {
                    return member.authId;
                });

                if (memberIds.indexOf(this.auth.getUser().authId) === -1) {
                    memberIds.push(this.auth.getUser().authId);
                }

                return memberIds;
            });
    }

}
