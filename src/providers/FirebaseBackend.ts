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

/**
 * We are using two Firebase services within this wrapper:
 * - FirebaseAuth to handle authentication
 * - Firestore as a real-time database to store data
 */
@Injectable()
export class FirebaseBackend extends Backend {

    private modelsFactory: ModelsFactory = new ModelsFactory();
    private roomObservables: Observable<Room[]>[] = [];
    private roomObservableUnsubcriptions: Function[] = [];

    public init(): Promise<void> {

        // This is the configuration to initialize FirebaseSDK with our app credentials
        // It may seem like this is private information and shouldn't be present in source code,
        // for example the API key, but since this will run with javascript, this information can
        // easily be obtained on any application client.
        // +info: https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public

        FirebaseSDK.initializeApp({
            "apiKey": "AIzaSyBGITd8llbUX7emW2CxlGuNJtHHIrGXNQM",
            "authDomain": "tcm-chat.firebaseapp.com",
            "databaseURL": "https://tcm-chat.firebaseio.com",
            "projectId": "tcm-chat",
            "storageBucket": "tcm-chat.appspot.com",
            "messagingSenderId": "893883273360"
        });

        // FirebaseSDK will be loaded when listening for auth state, this can be a user already logged in or null.

        return new Promise<void>((resolve: any) => {
            FirebaseSDK.auth().onAuthStateChanged(resolve);
        });
    }

    public getCurrentUser(): Promise<User | null> {
        return new Promise((resolve, reject) => {

            // First we retrieve the user from FirebaseAuth, but in case the user is logged in,
            // we need to transform it to our model class User. To do that, we also need the username,
            // which we are storing in Firestore (keep in mind that Firebase Auth and Firestore act as two separated services,
            // the fact that we have a 'users' collection is only because we have implemented it as such).

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

        // Same as in getCurrentUser method, we need to transform Firebase Auth data in our
        // model User class, and we need to retrieve the extra information from Firestore.

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

    public logout(): Promise<void> {
        return FirebaseSDK
            .auth()
            .signOut()
            .catch((error) => {
                throw new Error(error.message);
            });
    }

    public register(username: string, email: string, password: string): Promise<User> {

        // Here is were a user is registered, after succesfully creating an account with Firebase Auth,
        // we will create a user in our 'users' collection. Keep in mind that any validation such as username
        // format or password length is ultimately validated server-side, in this case within Firebase console
        // using Firestore rules. Any client-side validation can be useful for a better user experience but
        // shouldn't be trusted as secure validation (all client-side code can be tampered with).

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

                // If anything went wrong, remove any data that has been created with this operation.

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

        // This is a simple CRUD operation without much else to add, the only points worth mentioning
        // is that firebase members should be user auth Ids, and none should be duplicated. This also
        // can be validated server-side using Firestore rules. Also notice how the 'members' field is
        // an object instead of what could be a simple array. This is because Firestore does not support
        // querying array items, so it would make some operations difficult.
        // source: https://stackoverflow.com/questions/46849222/firestore-query-by-item-in-array-of-document

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

    public addRoomMembers(room: Room, members: string[]): Promise<void> {

        let firebaseMembers = {};

        for (let member of members) {
            firebaseMembers[member] = true;
        }

        for (let member of room.memberIds) {
            firebaseMembers[member] = true;
        }

        return FirebaseSDK
            .firestore()
            .collection('rooms')
            .doc(room.id)
            .update({
                members: firebaseMembers
            })
            .then(() => {
                for (let member of members) {
                    room.addMember(member);
                }
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

        // In order to leverage real-time functionality in an easy way, the onSnapshot callbacks
        // from Firestore are encapsulated inside an Observable instance. This is a design choice
        // and could be done differently, but it is usually a good approach since working with observables
        // is easier than working with callbacks. That is precisely the reason why observables and promises
        // were created in the first place.

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

                        // Members are loaded before creating messages because messages have an author field
                        // which requires the user to be loaded as a model User class.

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

        // To prevent memory-leaks, it is important to always unsubscribe from observables. Although in this
        // application we are not having into account many scenarios due to the nature of the workshop, keep
        // in mind a real application should be more thorough about the usage of observables.

        let index = this.roomObservables.indexOf(roomsObservable);

        if (index !== -1) {
            this.roomObservableUnsubcriptions[index]();
            this.roomObservables.splice(index, 1);
            this.roomObservableUnsubcriptions.splice(index, 1);
        }

    }

    private loadUsers(memberAuthIds: string[]): Promise<void> {

        // This method queries users from Firestore to have them loaded in memory any time a model User class
        // is necessary.

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

        // This is another design choice. Room messages could also have been implemented with an observable,
        // but it was chosen to use an imperative approach with listeners on the Room class in order to simplify
        // the implementation. The complexity of handling observables inside observables may not be something tribial
        // and more memory leaks can appear. Always keep in mind the requirements of the project and reduce complexity
        // as much as possible.

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

        // Find users matching a field from an array of values.

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

/**
 * This class is used to encapsulate the transformation from a Firestore document into this application's model classes. It
 * also stores references to loaded users to be used without the need to query them multiple times. Keep into account that a
 * real application should handle any user updates and invalidate this cache if necessary.
 */
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
