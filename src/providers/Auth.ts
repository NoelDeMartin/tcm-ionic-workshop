import { Injectable }   from '@angular/core';

import { User } from '../models/User';

import { Backend }  from './Backend';

@Injectable()
export class Auth {

    private user: User;
    private listeners: AuthListener[] = [];

    constructor(private backend: Backend) {}

    public init(): Promise<void> {
        return this.backend
            .getCurrentUser()
            .then((user: User | null) => {
                this.updateUser(user);
            });
    }

    public isLoggedIn(): boolean {
        return this.user !== null;
    }

    public getUser(): User | null {
        return this.user;
    }

    public addListener(listener: AuthListener): void {
        this.listeners.push(listener);
    }

    public login(email: string, password: string): Promise<void> {
        return this.backend
            .login(email, password)
            .then((user: User) => {
                this.updateUser(user);
            });
    }

    public register(username: string, email: string, password: string): Promise<void> {
        return this.backend
            .register(username, email, password)
            .then((user: User) => {
                this.updateUser(user);
            });
    }

    public logout(): Promise<void> {
        return this.backend
            .logout()
            .then(() => {
                this.updateUser(null);
            });
    }

    private updateUser(user: User | null): void {

        this.user = user;

        for (let listener of this.listeners) {
            listener.onUserUpdated(user);
        }

    }

}

export interface AuthListener {

    onUserUpdated(user: User | null): void;

}
