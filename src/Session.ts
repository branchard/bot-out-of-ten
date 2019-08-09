import {Message, Client, Channel, TextChannel, User} from "discord.js";

const TIMEOUT = 180;// in second = 3 min

export default class Session {
    private readonly _channel: TextChannel;
    private readonly _user: User;
    private _aborted: boolean = false;
    private _timeoutRef?: NodeJS.Timeout;
    private _onTimeout?: () => void;

    constructor(channel: TextChannel, user: User, onTimeout?: () => void) {
        this._channel = channel;
        this._user = user;

        this._onTimeout = onTimeout;

        this.setTimeout();
    }

    private setTimeout() {
        if (this._onTimeout) {
            this._timeoutRef = setTimeout(() => {
                this._onTimeout();
                this.abort();
            }, TIMEOUT * 1000);
        }
    }

    public resetTimeout() {
        if (this._onTimeout) {
            clearTimeout(this._timeoutRef);
            this.setTimeout();
        }
    }

    get channel(): TextChannel {
        return this._channel;
    }

    get user(): User {
        return this._user;
    }

    public abort(): void {
        this._aborted = true;

        if (this._timeoutRef) {
            clearTimeout(this._timeoutRef);
        }
    }

    public isAborted(): boolean {
        return this._aborted;
    }
};
