import { Injectable } from '@angular/core';

import FirebaseSDK  from 'firebase';
import {
    User as FirebaseUser,
    firestore as Firestore
} from 'firebase';
import 'firebase/firestore';

import { User }     from '../models/User';

import { Backend }  from './Backend';

@Injectable()
export class FirebaseBackend extends Backend {

    private modelsFactory: ModelsFactory = new ModelsFactory();

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

    public getUser(id: string): User {
        return this.users[id];
    }

    public hasLoadedUser(id: string): boolean {
        return id in this.users;
    }

}