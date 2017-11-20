import { Injectable } from '@angular/core';

import { User } from '../models/User';

import { Backend }  from './Backend';

@Injectable()
export class OfflineBackend extends Backend {

    private user: User = null;

    public init(): Promise<void> {

        // Use this to generate stubs

        /*
        this.user = this.createUserStub();

        let john = this.createUserStub('John Doe');

        this.createRoom(this.user, 'Welcome!', [john.authId])
            .then((room: Room) => {
                this.sendMessage(room, john, 'Hi there I am jhon');
                this.sendMessage(room, this.user, 'Hi there I am guest');
            });
        */

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

    private generateId(): string {
        return (Math.random() * 100000).toString();
    }

    private createUserStub(username: string = 'guest'): User {
        return new User(this.generateId(), this.generateId(), username);
    }

}