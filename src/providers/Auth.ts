import { Injectable }   from '@angular/core';

import { User } from '../models/User';

import { Backend }  from './Backend';

@Injectable()
export class Auth {

    private user: User;

    constructor(private backend: Backend) {}

    public init(): Promise<void> {
        return this.backend
            .getCurrentUser()
            .then((user: User | null) => {
                this.user = user;
            });
    }

    public isLoggedIn(): boolean {
        return this.user !== null;
    }

    public getUser(): User | null {
        return this.user;
    }

    public login(email: string, password: string): Promise<void> {
        return this.backend
            .login(email, password)
            .then((user: User) => {
                this.user = user;
            });
    }

    public register(username: string, email: string, password: string): Promise<void> {
        return this.backend
            .register(username, email, password)
            .then((user: User) => {
                this.user = user;
            });
    }

}