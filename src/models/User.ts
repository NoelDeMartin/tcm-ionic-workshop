export class User {

    public readonly id: string;
    public readonly authId: string;
    public readonly username: string;

    constructor(id: string, authId: string, username: string) {
        this.id = id;
        this.authId = authId;
        this.username = username;
    }

}