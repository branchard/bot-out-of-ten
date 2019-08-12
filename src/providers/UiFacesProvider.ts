import fetch from 'node-fetch';
import AbstractPersonProvider from "./AbstractPersonProvider";
import Person from "../Person";
import UUID from 'uuid-1345';
import Gender from "../Gender";
import sample from "lodash/sample";
const BASE_URL = 'https://uifaces.co/api?limit=1&random';

export default class UiFacesProvider extends AbstractPersonProvider {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
    }

    private getUrl(gender: Gender): string {
        return `${BASE_URL}&gender[]=${gender}`;
    }

    public async getRandom(gender: Gender): Promise<Person> {
        const realGender: Gender = gender === Gender.both ? sample([Gender.male, Gender.female]) : gender;

        let headers = new fetch.Headers();
        headers.append('X-API-KEY', this.apiKey);
        return fetch(this.getUrl(realGender), {
            method: 'GET',
            headers
        }).then(function (response) {
            return response.json();
        }).then(function (person) {
            // guildId based on photo url
            return new Person(UUID.v5({
                namespace: UUID.namespace.url,
                name: person[0].photo
            }), person[0].name, person[0].photo, realGender);
        });
    };
}
