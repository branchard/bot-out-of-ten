import {Attachment} from "discord.js";

export default class Person {
    private readonly _name: string;
    private readonly _email: string;
    private readonly _position: string;
    private readonly _photo: string;


    constructor(name: string, email: string, position: string, photo: string) {
        this._name = name;
        this._email = email;
        this._position = position;
        this._photo = photo;
    }

    get name(): string {
        return this._name;
    }

    get email(): string {
        return this._email;
    }

    get position(): string {
        return this._position;
    }

    get photo(): string {
        return this._photo;
    }

    get attachment(): Attachment {
        let photoName: string = 'person.jpg';
        if (this._photo.includes('.png')) {
            photoName = 'person.png';
        }
        return new Attachment(this._photo, photoName);
    }
}
