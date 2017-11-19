import { User } from '../models/User';

export abstract class Backend {

    abstract init(): Promise<void>;

    abstract login(email: string, password: string): Promise<User>;

    abstract register(username: string, email: string, password: string): Promise<User>;

}