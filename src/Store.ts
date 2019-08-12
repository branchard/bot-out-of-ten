import Datastore from 'nedb';
import Rating from "./Rating";
import mean from "lodash/mean";
import Person from "./Person";
import GuildPreferences from "./GuildPreferences";
import {Language} from "./lang";
import Gender from "./Gender";

type StoredPersonSchema = { _id: string, name: string, photo: string, gender: Gender, ratings: number[] };
type StoredPreferencesSchema = { _id: string, language: Language, gender: Gender };

export default class Store {
    private readonly ratingsDatastore: Datastore;
    private readonly prefrencesDatastore: Datastore;
    private readonly preferencesReferences: { [guildId: string]: GuildPreferences } = {};

    constructor(ratingsFilePath: string, preferencesFilePath: string) {
        this.ratingsDatastore = new Datastore({filename: ratingsFilePath, autoload: true});
        this.prefrencesDatastore = new Datastore({filename: preferencesFilePath, autoload: true});
    }

    public async getPreferencesFor(guildId: string): Promise<GuildPreferences> {
        const preferencesReference = this.preferencesReferences[guildId];
        if (preferencesReference) {
            return preferencesReference;
        }

        return new Promise((resolve, reject) => {
            this.prefrencesDatastore.findOne({_id: guildId}, {}, (err, document: StoredPreferencesSchema | null) => {
                if (err) {
                    reject(err);
                    return;
                }

                let gp = new GuildPreferences(guildId);

                if (document !== null) {
                    gp.language = document.language;
                    gp.gender = document.gender;
                }

                resolve(this.preferencesReferences[guildId] = gp);
            });
        });
    }

    public async persistPreferences(preferences: GuildPreferences): Promise<void> {
        const update: { $set: StoredPreferencesSchema } = {
            $set: {
                _id: preferences.guildId,
                language: preferences.language,
                gender: preferences.gender
            }
        };

        return new Promise((resolve, reject) => {
            this.prefrencesDatastore.update({_id: preferences.guildId}, update, {upsert: true}, (err) => {
                if (err) {
                    reject(err);
                    return
                }

                resolve();
            })
        });
    }

    public async persistRating(rating: Rating): Promise<void> {
        const update = {
            $set: {
                _id: rating.person.id,
                name: rating.person.name,
                photo: rating.person.photo,
                gender: rating.person.gender
            },
            $push: {ratings: rating.value}
        };

        return new Promise((resolve, reject) => {
            this.ratingsDatastore.update({_id: rating.person.id}, update, {upsert: true}, (err) => {
                if (err) {
                    reject(err);
                    return
                }

                resolve();
            })
        });
    }

    public async getTop(limit: number, inverted: boolean = false): Promise<Rating[]> {
        return new Promise((resolve, reject) => {
            this.ratingsDatastore.find({}).exec((err, docs: StoredPersonSchema[]) => {
                if (err) {
                    reject(err);
                    return
                }

                let means: (StoredPersonSchema & { mean: number })[] = docs.map((doc: any) => {
                    doc.mean = mean(doc.ratings);
                    return doc;
                });

                let sortedMeans = means.sort((a, b) => inverted ? a.mean - b.mean : b.mean - a.mean);

                let sortedMeansLimit = sortedMeans.slice(0, Math.min(sortedMeans.length, limit));

                let ratings: Rating[] = sortedMeansLimit.map((mean) => {
                    return new Rating(new Person(mean._id, mean.name, mean.photo, mean.gender), mean.mean)
                });
                resolve(ratings);
            });
        });
    }
}
