import { Injectable } from '@angular/core';

import moment   from 'moment';

import { Observable }       from 'rxjs/Observable';
import { BehaviorSubject }  from 'rxjs/BehaviorSubject';

import FirebaseSDK  from 'firebase';
import {
    User as FirebaseUser,
    firestore as Firestore
} from 'firebase';
import 'firebase/firestore';

import { User } from '../models/User';
import { Room } from '../models/Room';
import { Message }  from '../models/Message';

import { Backend }  from './Backend';

@Injectable()
export class FirebaseBackend extends Backend {

    private modelsFactory: ModelsFactory = new ModelsFactory();
    private roomObservables: Observable<Room[]>[] = [];
    private roomObservableUnsubcriptions: Function[] = [];

    public init(): Promise<void> {

        FirebaseSDK.initializeApp({
            "apiKey": "AIzaSyBGITd8llbUX7emW2CxlGuNJtHHIrGXNQM",
            "authDomain": "tcm-chat.firebaseapp.com",
            "databaseURL": "https://tcm-chat.firebaseio.com",
            "projectId": "tcm-chat",
            "storageBucket": "tcm-chat.appspot.com",
            "messagingSenderId": "893883273360"
        });

        return new Promise<void>((resolve: any) => {
            FirebaseSDK.auth().onAuthStateChanged(resolve);
        });
    }

    public getCurrentUser(): Promise<User | null> {
        return new Promise((resolve, reject) => {

            let currentUser = FirebaseSDK.auth().currentUser;

            if (!currentUser) {
                resolve(null);
            } else if (this.modelsFactory.hasLoadedUser(currentUser.uid)) {
                resolve(this.modelsFactory.getUser(currentUser.uid));
            } else {
                FirebaseSDK
                    .firestore()
                    .collection('users')
                    .where('auth_id', '==', currentUser.uid)
                    .get()
                    .then((snapshot: Firestore.QuerySnapshot) => {
                        resolve(
                            snapshot.docs.length > 0
                                ? this.modelsFactory.makeUser(snapshot.docs[0])
                                : null
                        );
                    });
            }

        });
    }

    public login(email: string, password: string): Promise<User> {
        return FirebaseSDK
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then((user: FirebaseUser) => {
                return FirebaseSDK
                    .firestore()
                    .collection('users')
                    .where('auth_id', '==', user.uid)
                    .get();
            })
            .then((snapshot: Firestore.QuerySnapshot) => {
                return snapshot.docs.length > 0
                    ? this.modelsFactory.makeUser(snapshot.docs[0])
                    : null;
            })
            .catch((error) => {
                throw new Error(error.message);
            });
    }

    public register(username: string, email: string, password: string): Promise<User> {

        let authUser: FirebaseUser;

        return FirebaseSDK
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then((user: FirebaseUser) => {
                authUser = user;
                return FirebaseSDK
                    .firestore()
                    .collection('users')
                    .add({
                        username: username,
                        auth_id: user.uid
                    });
            })
            .then((reference: Firestore.DocumentReference) => {
                return reference.get();
            })
            .then((snapshot: Firestore.DocumentSnapshot) => {
                return this.modelsFactory.makeUser(snapshot);
            })
            .catch((error) => {
                return (
                    authUser ? authUser.delete() : Promise.resolve()
                ).then(() => {
                    throw new Error(error.message);
                });
            });
    }

    public findUsersByUsername(usernames: string[]): Promise<User[]> {
        return this.findUsers('username', usernames);
    }

    public createRoom(user: User, topic: string, members: string[]): Promise<Room> {

        let firebaseMembers = {};

        for (let member of members) {
            firebaseMembers[member] = true;
        }

        return FirebaseSDK
            .firestore()
            .collection('rooms')
            .add({
                topic: topic,
                owner: user.authId,
                members: firebaseMembers,
                created_at: new Date(),
                last_active_at: new Date()
            })
            .then((reference: Firestore.DocumentReference) => {
                return reference.get();
            })
            .then((snapshot: Firestore.DocumentSnapshot) => {
                return this.modelsFactory.makeRoom(snapshot);
            })
            .catch((error) => {
                throw new Error(error.message);
            });
    }

    public sendMessage(room: Room, author: User, text: string): Promise<void> {
        return FirebaseSDK
            .firestore()
            .collection('rooms')
            .doc(room.id)
            .collection('messages')
            .add({
                author: author.authId,
                text: text,
                date: new Date()
            })
            .then(() => {});
    }

    public observeUserRooms(user: User): Observable<Room[]> {

        let roomsSubject = new BehaviorSubject<Room[]>([]);
        let rooms: Room[] = [];
        let unsubscribe =
            FirebaseSDK
                .firestore()
                .collection('rooms')
                .where('members.' + user.authId, '==', true)
                .onSnapshot((snapshot: Firestore.QuerySnapshot) => {

                    snapshot.docChanges.forEach((change: Firestore.DocumentChange) => {

                        let room = this.modelsFactory.makeRoom(change.doc);
                        let memberAuthIds = Object.keys(change.doc.data()['members']);

                        this.loadUsers(memberAuthIds)
                            .then(() => {

                                if (change.type == 'added') {

                                    change.doc.ref
                                        .collection('messages')
                                        .onSnapshot((snapshot: Firestore.QuerySnapshot) => {
                                            this.updateRoomMessages(room, snapshot);
                                        });

                                    rooms.push(room);

                                }

                                // TODO implement removed and modified changes

                            });

                    });

                    roomsSubject.next(rooms.sort((a: Room, b: Room) => {
                        return a.lastActiveAt > b.lastActiveAt ? -1 : 1;
                    }));

                });

        let observable = roomsSubject.asObservable();

        this.roomObservables.push(observable);
        this.roomObservableUnsubcriptions.push(unsubscribe);

        return observable;
    }

    public unsubscribeRoomsObservable(roomsObservable: Observable<Room[]>): void {

        let index = this.roomObservables.indexOf(roomsObservable);

        if (index !== -1) {
            this.roomObservableUnsubcriptions[index]();
            this.roomObservables.splice(index, 1);
            this.roomObservableUnsubcriptions.splice(index, 1);
        }

    }

    private loadUsers(memberAuthIds: string[]): Promise<void> {

        let unloadedMemberAuthIds: string[] = memberAuthIds.filter((memberAuthId: string) => {
            return !this.modelsFactory.hasLoadedUser(memberAuthId);
        });

        if (unloadedMemberAuthIds.length == 0) {
            return Promise.resolve();
        } else {
            return this.findUsers('auth_id', unloadedMemberAuthIds).then(() => {});
        }

    }

    private updateRoomMessages(room: Room, snapshot: Firestore.QuerySnapshot): void {
        snapshot.docChanges.forEach((change: Firestore.DocumentChange) => {
            switch (change.type) {
                case 'added':
                case 'modified': // fall through
                    try {
                        room.addMessage(this.modelsFactory.makeMessage(change.doc));
                    } catch (e) {
                        if (e instanceof UserNotLoaded) {
                            this.loadUsers([e.userAuthId])
                                .then(() => {
                                    room.addMessage(this.modelsFactory.makeMessage(change.doc));
                                });
                        } else {
                            throw e;
                        }
                    }
                    break;
                case 'removed':
                    room.removeMessage(change.doc.id);
                    break;
            }
        });
    }

    private findUsers(field: string, values: any[]): Promise<User[]> {
        return new Promise<User[]>((resolve, reject) => {

            let count = values.length;
            let users: User[] = [];

            for (let value of values) {

                // This would seem to have bad performance, but since firebase pipelines requests
                // this is actually the way to do it
                // +info: https://stackoverflow.com/questions/35931526/speed-up-fetching-posts-for-my-social-network-app-by-using-query-instead-of-obse/35932786#35932786

                FirebaseSDK
                    .firestore()
                    .collection('users')
                    .where(field, '==', value)
                    .get()
                    .then((snapshot: Firestore.QuerySnapshot) => {

                        users = users.concat(
                            snapshot.docs.map((document: Firestore.DocumentSnapshot) => {
                                return this.modelsFactory.makeUser(document);
                            })
                        );

                        if (--count == 0) {
                            resolve(users);
                        }

                    })
                    .catch(() => {
                        if (--count == 0) {
                            resolve(users);
                        }
                    });

            }

        });
    }

}

class ModelsFactory {

    private users: {
        [authId: string]: User
    } = {};

    public makeUser(snapshot: Firestore.DocumentSnapshot): User {

        let data = snapshot.data();
        let user = new User(snapshot.id, data['auth_id'], data['username']);

        this.users[user.authId] = user;

        return user;
    }

    public makeRoom(snapshot: Firestore.DocumentSnapshot): Room {
        let data = snapshot.data();
        return new Room(snapshot.id, data['topic'], data['last_active_at'], Object.keys(data['members']));
    }

    public getUser(id: string): User {
        return this.users[id];
    }

    public makeMessage(snapshot: Firestore.DocumentSnapshot): Message {

        let data = snapshot.data();

        if (!this.hasLoadedUser(data['author'])) {
            throw new UserNotLoaded(data['author']);
        }

        return new Message(
            snapshot.id,
            this.users[data['author']],
            data['text'],
            moment(data['date'])
        );
    }

    public hasLoadedUser(id: string): boolean {
        return id in this.users;
    }

}

class UserNotLoaded extends Error {

    public userAuthId: string;

    constructor(userAuthId: string) {
        super('User not loaded: ' + userAuthId);
        this.userAuthId = userAuthId;
    }

}
