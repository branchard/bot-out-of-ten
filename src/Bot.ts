import {Message, Client, Channel, TextChannel, User, Guild, RichEmbed} from "discord.js";
import Session from "./Session";
import Person from "./Person";
import Rating from "./Rating";
import sample from "lodash/sample"
import lang, {Language} from "./lang";
import randomColor from 'randomcolor';
import AbstractPersonProvider from "./providers/AbstractPersonProvider";
import Store from "./Store";
import GuildPreferences from "./GuildPreferences";
import Settings from './Settings';
import Gender from "./Gender";

class Bot {
    private readonly sessions: Array<Session> = [];
    private readonly providers: AbstractPersonProvider[];
    private readonly store: Store;

    constructor(providers: AbstractPersonProvider[], store: Store) {
        this.providers = providers;
        this.store = store;

        this.handleNewMessage = this.handleNewMessage.bind(this);
        this.startSession = this.startSession.bind(this);
    }

    public async handleNewMessage(message: Message): Promise<void> {
        const preferences: GuildPreferences = await this.store.getPreferencesFor(message.guild.id);

        let trimmedContent = message.content.trim();
        if (trimmedContent.startsWith(Settings.commandsPrefix + ' ')) {
            const commandAndArgs = trimmedContent.substring(Settings.commandsPrefix.length + 1).trim().replace(/ +(?= )/g, '').split(' ');
            if (commandAndArgs.length <= 0) {
                return;
            }

            const [command, ...args] = commandAndArgs;
            switch (command) {
                case Settings.Commands.Start:
                    this.startSession(preferences, message.author, message.channel);
                    break;
                case Settings.Commands.Stop:
                    this.stopSession(preferences, message.author, message.channel);
                    break;
                case Settings.Commands.Lang:
                    // list languages
                    if (args.length <= 0) {
                        message.channel.send(new RichEmbed()
                            .setColor(randomColor({
                                luminosity: 'bright',
                                hue: 'blue'
                            }))
                            .addField('Les langues disponnibles sont (* : séléctionnée) :speech_balloon:', Object.keys(Language).map((l) => l === preferences.language ? `**${Language[l]}** *`: Language[l]).join('\n')));
                        break;
                    }

                    if(!Object.keys(Language).map(l => Language[l]).includes(args[0])){
                        message.channel.send('Langue indisponnible');
                        break;
                    }

                    preferences.language = <Language>Object.keys(Language).find(x => Language[x] == args[0]);
                    this.store.persistPreferences(preferences);
                    message.channel.send(`La langue **${Language[preferences.language]}** est maintenant sélectionnée`);
                    break;
                case Settings.Commands.Gender:
                    // list genders
                    if (args.length <= 0) {
                        message.channel.send(new RichEmbed()
                            .setColor(randomColor({
                                luminosity: 'bright',
                                hue: 'blue'
                            }))
                            .addField('Les genres disponnibles sont (* : séléctionnée) :restroom:', Object.keys(Gender).map((g) => g === preferences.gender ? `**${g}** *`: g).join('\n')));
                        break;
                    }

                    if(!Object.keys(Gender).includes(args[0])){
                        message.channel.send('Genre indisponnible');
                        break;
                    }

                    preferences.gender = <Gender>Object.keys(Gender).find(g => g == args[0]);
                    this.store.persistPreferences(preferences);
                    message.channel.send(`Le genre **${preferences.gender}** est maintenant sélectionné`);
                    break;
                case Settings.Commands.Rank:
                    if (args.length > 0 && args.includes('reverse')) {
                        this.sendRank(preferences, message.channel, true);
                        break;
                    }
                    this.sendRank(preferences, message.channel);
                    break;
                case Settings.Commands.Help:
                    message.channel.send(new RichEmbed()
                        .setColor(randomColor({
                            luminosity: 'bright',
                            hue: 'blue'
                        }))
                        .addField(lang.HELP_TITLE(preferences.language), lang.HELP(preferences.language)));
                    break;
            }
            return;
        }
    }

    private stopSession(preferences: GuildPreferences, user: User, channel: Channel) {
        const sessions = this.sessions.filter((session: Session) => {
            return session.channel.id === channel.id && session.user.id === user.id;
        });

        if (sessions.length > 0) {
            sessions.forEach((session: Session) => {
                if (channel instanceof TextChannel) {
                    channel.send(lang.SUCCESSFULLY_STOP(preferences.language, {user}));
                }
                session.abort();
            });
        } else {
            if (channel instanceof TextChannel) {
                channel.send(lang.WRONG_USER_STOP(preferences.language, {user}));
            }
        }
    }

    private async startSession(preferences: GuildPreferences, user: User, channel: Channel) {
        console.log(`start session with user ${user}`);
        if (!(channel instanceof TextChannel)) {
            console.warn(`Cannot start on non-text channel: ${channel.id}`);
            return;
        }

        let currentSession = this.sessions.find((session: Session) => {
            return session.channel.id === channel.id;
        });

        if (currentSession) {
            console.log(`Bot already started on channel: ${channel.id}`);
            if (currentSession.user.id === user.id) {
                channel.send(lang.SELF_START_ANOTHER_SESSION(preferences.language, {user}));
            } else {
                channel.send(lang.START_ANOTHER_SESSION(preferences.language, {user: currentSession.user}));

            }
            return;
        }
        currentSession = new Session(channel, user, () => {
            channel.send(lang.SESSION_TIMEOUT(preferences.language, {user}));
        });
        this.sessions.push(currentSession);

        try {
            let queue = this.provideCancelableQueue(preferences, channel, user);
            let resumeValue: any;
            while (!currentSession.isAborted()) {
                let n = queue.next(resumeValue);

                if (n.done) {
                    break;
                }

                if (n.value instanceof Promise) {
                    resumeValue = await n.value;
                } else {
                    resumeValue = n.value
                }

                currentSession.resetTimeout();
            }

            // if (resumeValue instanceof Array) {
            //     storeRates(resumeValue);
            // }
        } catch (e) {
            console.error(e);
        }

        currentSession.abort();
        let currentSessionIndex = this.sessions.indexOf(currentSession);
        if (currentSessionIndex !== -1) {
            this.sessions.splice(currentSessionIndex, 1);
        }

        console.log(`session end with user ${user}`);
    }

    private* provideCancelableQueue(preferences: GuildPreferences, channel: TextChannel, user: User): IterableIterator<Promise<any>> | any {
        yield channel.send(lang.SESSION_START(preferences.language, {user}));
        yield channel.send(lang.SESSION_INSTRUCTIONS(preferences.language));
        yield channel.send(lang.SESSION_LETS_GO(preferences.language));

        for (let i = 0; i < 5; i++) {
            let provider: AbstractPersonProvider = sample(this.providers);
            let currentPerson: Person = yield provider.getRandom(preferences.gender);
            yield channel.send(lang.SESSION_NEW_PERSON(preferences.language, {i, name: currentPerson.name}), currentPerson.attachment);
            yield channel.send(lang.SESSION_WAITING(preferences.language));

            while (true) {
                let collected1 = yield channel.awaitMessages(response => response.author.id === user.id, {max: 1});
                let message = collected1.first();

                let regex = /^(?:.*\s)?0*(\d{1,2}(?:[.,]\d+)?)(?:\s.*)?$/;
                let match = regex.exec(message.content);
                if (match == null || match.length < 2) {
                    continue;
                }
                let userRate = match[1];
                let parsedUserRate: number = Bot.parseUserRate(userRate);

                if (parsedUserRate === null) {
                    yield channel.send(lang.SESSION_INVALID_RATE(preferences.language));
                    continue;
                }

                yield this.store.persistRating(new Rating(currentPerson, parsedUserRate));
                break;
            }
            yield channel.send(lang.SESSION_VALID_RATE(preferences.language));
        }
        yield channel.send(lang.SESSION_FINISH(preferences.language));
    }

    private async sendRank(preferences: GuildPreferences, channel: Channel, reverse: boolean = false): Promise<void> {
        if (!(channel instanceof TextChannel)) {
            return
        }

        let top = await this.store.getTop(5, preferences.gender, reverse);

        let colors: string[] = randomColor({
            count: top.length + 1,
            luminosity: 'bright',
            hue: 'blue'
        });

        await channel.send(new RichEmbed()
            .setColor(colors.pop())
            .setTitle(reverse ? lang.RANK_START_REVERSE(preferences.language, {number: top.length}) : lang.RANK_START(preferences.language, {number: top.length})));


        for (let ratingIndex in top) {
            await channel.send(new RichEmbed()
                .setColor(colors.pop())
                .addField(`# ${Number(ratingIndex) + 1} _${top[ratingIndex].person.name}_`, `avec une moyenne de ${top[ratingIndex].value.toFixed(2)}`)
                .setImage(top[ratingIndex].person.photo));
        }
    }

    private static parseUserRate(rate: string): number | null {
        let rateNumber: number = null;
        if (rate.includes(',')) {
            rateNumber = Number(rate.replace(',', '.'));
        } else {
            rateNumber = Number(rate);
        }

        // if note not valid
        if (isNaN(rateNumber) || rateNumber < 0 || rateNumber > 10) {
            return null;
        }

        return rateNumber;
    }
}

export default Bot;
