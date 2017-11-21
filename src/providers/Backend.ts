import { Observable }   from 'rxjs/Observable';

import { User } from '../models/User';
import { Room } from '../models/Room';

export abstract class Backend {

    abstract init(): Promise<void>;

    abstract getCurrentUser(): Promise<User | null>;

    abstract login(email: string, password: string): Promise<User>;

    abstract register(username: string, email: string, password: string): Promise<User>;

    abstract findUsersByUsername(usernames: string[]): Promise<User[]>;

    abstract createRoom(user: User, topic: string, members: string[]): Promise<Room>;

    abstract observeUserRooms(user: User): Observable<Room[]>;

    abstract unsubscribeRoomsObservable(roomsObservable: Observable<Room[]>): void;

}