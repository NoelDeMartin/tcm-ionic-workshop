import { Moment }   from 'moment';

import { User } from './User';

export class Message {

    id: string;
    author: User;
    text: string;
    date: Moment;

    constructor(id: string, author: User, text: string, date: Moment) {
        this.id = id;
        this.author = author;
        this.text = text;
        this.date = date;
    }

}