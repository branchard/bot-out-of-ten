import {Language, DEFAULT_LANGUAGE} from "./lang";
import Gender, {DEFAULT_GENDER} from "./Gender";

export default class GuildPreferences {
    private _language: Language;
    private _gender: Gender;
    private readonly _guildId: string;

    constructor(guildId: string) {
        this._guildId = guildId;
        this._language = DEFAULT_LANGUAGE;
        this._gender = DEFAULT_GENDER;
    }

    get guildId(): string {
        return this._guildId;
    }

    get language(): Language {
        return this._language;
    }

    set language(value: Language) {
        this._language = value;
    }

    get gender(): Gender {
        return this._gender;
    }

    set gender(value: Gender) {
        this._gender = value;
    }
}
