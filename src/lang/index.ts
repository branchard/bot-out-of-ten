import sample from "lodash/sample";

export enum Language {
    fr = 'fr',
    ble = 'blé'
}

export enum s {
    SUCCESSFULLY_STOP,
    WRONG_USER_STOP,
    SELF_START_ANOTHER_SESSION,
    START_ANOTHER_SESSION,

    SESSION_START,
    SESSION_INSTRUCTIONS,
    SESSION_LETS_GO,
    SESSION_NEW_PERSON,
    SESSION_WAITING,
    SESSION_INVALID_RATE,
    SESSION_VALID_RATE,
    SESSION_FINISH,
    SESSION_TIMEOUT,

    RANK_START,
    RANK_START_REVERSE,

    HELP_TITLE,
    HELP
}

const FALLBACK_LANGUAGE: Language = <Language>Object.keys(Language).find(x => Language[x] == Language.fr);
export const DEFAULT_LANGUAGE: Language = <Language>Object.keys(Language).find(x => Language[x] == Language.fr);

export function t(...args) {
    return (props?: {}) => {
        if (props === undefined) {
            props = {};
        }

        if (typeof args[0] === 'string') {
            return args[0];
        }

        let stringBuilder = '';
        for (let i = 0; i < args[0].length - 1; i++) {
            stringBuilder += args[0][i] + args[i + 1](props);
        }

        stringBuilder += args[0][args[0].length - 1];
        return stringBuilder;
    };
}

export function g(...ts) {
    return (props?: {}) => {
        let t = sample(ts);
        return t(props);
    }
}

const languagesSentences = {};

for (let language in Language) {
    languagesSentences[language] = require(`./${language}.lang`).default;
}

function getTranslationFor(sentence: s): (selectedLanguage?: Language, props?: {}) => string {
    return (selectedLanguage?: Language, props?: {}) => {
        let currentLanguage: Language = FALLBACK_LANGUAGE;
        if (selectedLanguage !== null) {
            currentLanguage = selectedLanguage;
        }

        let currentLanguageSentences = languagesSentences[currentLanguage];

        let translation: (props: {}) => string = currentLanguageSentences[s[sentence]];

        if (translation === undefined) {
            let fallbackLanguageSentences = languagesSentences[FALLBACK_LANGUAGE];
            translation = fallbackLanguageSentences[sentence];

            if (translation === undefined) {
                return 'Translation_missing';
            }
        }

        return translation(props);
    }
}

const sentences = <{ [key in keyof typeof s]: (selectedLanguage: Language, props?: {}) => string }>{};

for (let _s of Object.values(s).filter(x => typeof x === 'string')) {
    sentences[_s] = getTranslationFor(_s)
}

export default sentences;
