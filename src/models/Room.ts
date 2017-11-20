import { Moment }   from 'moment';

export class Room {

    public readonly id: string;
    public readonly topic: string;
    public readonly lastActiveAt: Moment;
    public readonly memberIds: string[];


    constructor(id: string, topic: string, lastActiveAt: Moment, memberIds: string[]) {
        this.id = id;
        this.topic = topic;
        this.lastActiveAt = lastActiveAt;
        this.memberIds = memberIds;
    }

}