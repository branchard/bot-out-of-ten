import {Attachment} from "discord.js";
import Gender from "./Gender";

export default class Person {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _photo: string;
    private readonly _gender: Gender;

    constructor(id: string, name: string, photo: string, gender: Gender) {
        this._id = id;
        this._name = name;
        this._photo = photo;
        this._gender = gender;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get photo(): string {
        return this._photo;
    }

    get gender(): Gender {
        return this._gender;
    }

    get attachment(): Attachment {
        let photoName: string = 'person.jpg';
        if (this._photo.includes('.png')) {
            photoName = 'person.png';
        }
        return new Attachment(this._photo, photoName);
    }
}
