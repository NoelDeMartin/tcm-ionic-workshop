import { Injectable }   from '@angular/core';

import { User } from '../models/User';
import { Room } from '../models/Room';

import { Auth }     from './Auth';
import { Backend }  from './Backend';

@Injectable()
export class Chat {

    constructor(private backend: Backend, private auth: Auth) {}

    public createRoom(topic: string, memberUsernames: string[]): Promise<Room> {

        if (!this.auth.isLoggedIn()) return Promise.reject(new Error('User not authenticated'));

        return this
            .prepareRoomMembers(memberUsernames)
            .then((members: string[]) => {
                return this.backend.createRoom(this.auth.getUser(), topic, members);
            });
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