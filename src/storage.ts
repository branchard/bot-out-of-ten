import Rating from "./Rating";
import fs from "fs";
import path from "path";
import Person from "./Person";

const RATES_FILE_PATH = path.join(__dirname, '../ratings.json');

type RateJson = { person: { name: string, email: string, position: string, photo: string }, value: number };

async function getSoredRatesJson(): Promise<Array<RateJson>> {
    return new Promise((resolve, reject) => {
        fs.readFile(RATES_FILE_PATH, 'utf8', (err, content) => {
            if (err) {
                console.error(err);
            } else {
                try {
                    resolve(JSON.parse(content));
                    return
                } catch (err) {
                    console.error(err);
                }
            }
            resolve([]);
            return;
        });
    });
}

export async function getStoredRates(): Promise<Array<Rating>> {
    let soredRatesJson: Array<RateJson> = await getSoredRatesJson();
    return soredRatesJson.map((rate) => {
        return new Rating(new Person(rate.person.name, rate.person.email, rate.person.position, rate.person.photo), rate.value);
    });
}

export async function storeRates(rates: Array<Rating>): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const alreadyStoredRatesJson: Array<RateJson> = await getSoredRatesJson();
        const allRates: Array<RateJson> = [...alreadyStoredRatesJson, ...rates.map((rate: Rating) => {
            return {
                person: {
                    name: rate.person.name,
                    email: rate.person.email,
                    position: rate.person.position,
                    photo: rate.person.photo
                }, value: rate.value
            }
        })];

        fs.writeFile(RATES_FILE_PATH, JSON.stringify(allRates), {flag: 'w', encoding: 'utf8'}, (err) => {
            if (err) {
                console.error(err);
            }

            resolve();
        });
    });


}
