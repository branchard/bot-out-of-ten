import dotenv from 'dotenv';
import Bot from './Bot';
import {Client, TextChannel} from "discord.js";
import readline from "readline";
import UiFacesProvider from "./providers/UiFacesProvider";
import Store from "./Store";
import path from "path";
import Settings from './Settings';

dotenv.config();

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const client: Client = new Client;

client.on('ready', () => {
    const bot = new Bot([new UiFacesProvider(process.env.UIFACES_API_KEY)], new Store(path.join(__dirname, '../ratings.db'), path.join(__dirname, '../preferences.db')));
    client.on('message', bot.handleNewMessage);

    rl.on('line', (line: string) => {
        for (const [, guild] of client.guilds) {
            try {
                for (const [, channel] of guild.channels) {
                    if (channel instanceof TextChannel) {
                        channel.send(line);
                        break;
                    }
                }
            } catch (e) {
                console.error(`Cannot send line to Guild ${guild.name}`, e);
            }
        }
    });

    client.user.setStatus('online');
    client.user.setActivity(`${Settings.commandsPrefix} ${Settings.Commands.Help}`, {type: "WATCHING"})

    console.log('Client started...');
});

client.on('error', (err) => {
    console.error('Client error:', err);
});

client.on('disconnect', () => {
    console.warn('Client disconnect');
});

client.on('reconnecting', () => {
    console.warn('Client reconnecting');
});

client.login(process.env.DISCORD_LOGIN_TOKEN)
    .then(() => {
        console.log('Client logged')
    })
    .catch((...args) => {
        console.error('Unable to log the client', ...args)
    });

process.on('SIGINT', async () => {
    console.log("Caught interrupt signal");
    let err: boolean = false;
    try {
        await client.user.setStatus("invisible");
    } catch (e) {
        err = true;
        console.error(e);
    }

    try {
        await client.destroy();
    } catch (e) {
        err = true;
        console.error(e);
    }

    console.log('Process exit:', Number(err));

    process.exit(Number(err));
});
