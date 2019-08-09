import fetch from 'node-fetch';
import AbstractPersonProvider from "./AbstractPersonProvider";
import Person from "../Person";

export default class UiFacesProvider extends AbstractPersonProvider {
    private readonly url: string;
    private readonly apiKey: string;

    constructor(apiKey: string, gender: 'female' | 'male') {
        super();
        this.url = 'https://uifaces.co/api?limit=1&gender[]=female&random';
        this.apiKey = apiKey;
    }

    public async getRandom(): Promise<Person> {
        let headers = new fetch.Headers();
        headers.append('X-API-KEY', this.apiKey);
        return fetch(this.url, {
            method: 'GET',
            headers
        }).then(function (response) {
            return response.json();
        }).then(function (person) {
            return new Person(person[0].name, person[0].email, person[0].position, person[0].photo);
        });
    };
}
