import { Injectable }   from '@angular/core';

import { User } from '../models/User';

import { Backend }  from './Backend';

@Injectable()
export class Auth {

    private user: User;

    constructor(private backend: Backend) {}

    public login(email: string, password: string): Promise<void> {
        return this.backend
            .login(email, password)
            .then((user: User) => {
                this.user = user;
            });
    }

}