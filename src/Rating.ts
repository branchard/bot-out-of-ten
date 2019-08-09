import Person from "./Person";

export default class Rating {
    private readonly _person: Person;
    private readonly _value: number;

    constructor(person: Person, value: number) {
        this._person = person;
        this._value = value;
    }

    get person(): Person {
        return this._person;
    }

    get value(): number {
        return this._value;
    }

    public toString(): any {
        return String(this._value);
    }
}
