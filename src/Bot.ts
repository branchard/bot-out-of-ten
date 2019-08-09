import {Message, Client, Channel, TextChannel, User, Guild} from "discord.js";
import Session from "./Session";
import Person from "./Person";
import Rating from "./Rating";
import {getStoredRates, storeRates} from "./storage";
import mean from "lodash/mean"
import sample from "lodash/sample"
import lang from "./lang";
import AbstractPersonProvider from "./providers/AbstractPersonProvider";

const commandsPrefix = '!bot ';

enum Commands {
    Start = 'start',
    Stop = 'stop',
    Avg = 'avg',
    Rank = 'rank'
}

class Bot {
    private readonly client: Client;
    // private locks: Array<Lock> = [];
    private sessions: Array<Session> = [];
    private providers: AbstractPersonProvider[];

    constructor(client: Client, providers: AbstractPersonProvider[]) {
        // if client is not ready
        if (client.status !== 0) {
            throw 'You must instantiate the Bot with a ready discord.Client';
        }

        this.client = client;
        this.providers = providers;

        this.handleNewMessage = this.handleNewMessage.bind(this);
        this.startSession = this.startSession.bind(this);
        this.run = this.run.bind(this);
    }

    public run() {
        this.client.on('message', this.handleNewMessage);
    }

    private handleNewMessage(message: Message): void {
        let trimmedContent = message.content.trim();
        if (trimmedContent.startsWith(commandsPrefix)) {
            const commandAndArgs = trimmedContent.substring(commandsPrefix.length).trim().replace(/ +(?= )/g, '').split(' ');
            if (commandAndArgs.length <= 0) {
                return;
            }

            const [command, ...args] = commandAndArgs;
            switch (command) {
                case Commands.Start:
                    this.startSession(message.author, message.channel);
                    break;
                case Commands.Stop:
                    this.stopSession(message.author, message.channel);
                    break;
                case Commands.Avg:
                    if (args.length <= 0) {
                        return;
                    }
                    this.sendAvg(args.join(' '), message.channel);
                    break;
                case Commands.Rank:
                    if (args.length > 0 && args.includes('reverse')) {
                        this.sendRank(message.channel, true);
                        return;
                    }
                    this.sendRank(message.channel);
                    break;
            }
            return;
        }

        if (!message.author.bot && (trimmedContent.includes('bot') || trimmedContent.includes('serieux'))) {
            message.reply('<:serieux:570361303483285524>');
        }
    }

    private stopSession(user: User, channel: Channel) {
        const sessions = this.sessions.filter((session: Session) => {
            return session.channel.id === channel.id && session.user.id === user.id;
        });

        if (sessions.length > 0) {
            sessions.forEach((session: Session) => {
                if (channel instanceof TextChannel) {
                    channel.send(lang.SUCCESSFULLY_STOP({user}));
                }
                session.abort();
            });
        } else {
            if (channel instanceof TextChannel) {
                channel.send(lang.WRONG_USER_STOP({user}));
            }
        }
    }

    private async startSession(user: User, channel: Channel) {
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
                channel.send(lang.SELF_START_ANOTHER_SESSION({user}));
            } else {
                channel.send(lang.START_ANOTHER_SESSION({user: currentSession.user}));

            }
            return;
        }
        currentSession = new Session(channel, user, () => {
            channel.send(lang.SESSION_TIMEOUT({user}));
        });
        this.sessions.push(currentSession);

        try {
            let queue = this.provideCancelableQueue(channel, user);
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

            if (resumeValue instanceof Array) {
                storeRates(resumeValue);
            }
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

    private* provideCancelableQueue(channel: TextChannel, user: User): IterableIterator<Promise<any>> | any {

        let ratings: Array<Rating> = [];

        yield channel.send(lang.SESSION_START({user}));
        yield channel.send(lang.SESSION_INSTRUCTIONS());
        yield channel.send(lang.SESSION_LETS_GO());

        for (let i = 0; i < 5; i++) {
            let provider: AbstractPersonProvider = sample(this.providers);
            let currentPerson: Person = yield provider.getRandom();
            yield channel.send(lang.SESSION_NEW_PERSON({i, name: currentPerson.name}), currentPerson.attachment);
            yield channel.send(lang.SESSION_WAITING());

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
                    yield channel.send(lang.SESSION_INVALID_RATE());
                    continue;
                }

                ratings.push(new Rating(currentPerson, parsedUserRate));
                break;
            }
            yield channel.send(lang.SESSION_VALID_RATE());
        }
        yield channel.send(lang.SESSION_FINISH({ratings}));

        yield ratings;
    }

    private async sendAvg(name: string, channel: Channel): Promise<void> {
        if (!(channel instanceof TextChannel)) {
            return
        }

        const rates: Array<Rating> = await getStoredRates();
        const filteredRates: Array<Rating> = rates.filter((rate: Rating) => {
            return rate.person.name === name;
        });

        if (filteredRates.length <= 0) {
            channel.send(`${name} n'a pas encore de note blé`);
            return;
        }

        let sum: number = 0;
        for (let rate of filteredRates) {
            sum += rate.value;
        }

        let avg: number = sum / filteredRates.length;

        channel.send(`${name} à une moyenne de ${avg}/10`);
    }

    private async sendRank(channel: Channel, reverse: boolean = false): Promise<void> {
        if (!(channel instanceof TextChannel)) {
            return
        }

        const rates: Array<Rating> = await getStoredRates();

        const ratesPerPerson: Array<{ person: Person, values: number[] }> = [];

        for (let rate of rates) {
            let alreadyExistingPersonIndex = ratesPerPerson.findIndex((ratePerPerson) => {
                return ratePerPerson.person.name === rate.person.name;
            });

            if (alreadyExistingPersonIndex > -1) {
                ratesPerPerson[alreadyExistingPersonIndex].values.push(rate.value);
            } else {
                ratesPerPerson.push({person: rate.person, values: [rate.value]})
            }
        }

        const personsAverage: { person: Person, avg: number }[] = ratesPerPerson.map((ratePerPerson) => {
            return {person: ratePerPerson.person, avg: mean(ratePerPerson.values)}
        });

        const sortedPersonsAverage: { person: Person, avg: number }[] = personsAverage.sort((personAverageA, personAverageB) => {
            return personAverageB.avg - personAverageA.avg;
        });

        if(reverse){
            sortedPersonsAverage.reverse();
        }

        const top = sortedPersonsAverage.slice(0, Math.min(sortedPersonsAverage.length, 10));

        await channel.send(`Voila les ${top.length} ${reverse ? 'pires' : 'meilleurs'} meufs:`);

        for (let i = 0; i < top.length; i++) {
            let personAverage = top[i];
            await channel.send(`${i + 1}: ${personAverage.person.name} avec une moyenne de ${personAverage.avg.toFixed(2)}`, personAverage.person.attachment);
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
