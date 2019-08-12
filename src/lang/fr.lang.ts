import Settings from '../Settings';
import {t, g, s} from './index';

export default {
    [s.SUCCESSFULLY_STOP]: t`Ok ${props => props.user} je stop là`,
    [s.WRONG_USER_STOP]: t`${props => props.user} tu ne peux pas stopper la partie`,
    [s.SELF_START_ANOTHER_SESSION]: g(
        t`Tu ne peux pas relancer une partie`,
        t`${props => props.user}, tu ne peux pas relancer une partie`
    ),
    [s.START_ANOTHER_SESSION]: g(
        t`Je termine avec ${props => props.user}`,
        t`J'ai pas fini avec ${props => props.user}`,
    ),
    [s.SESSION_TIMEOUT]: t`${props => props.user}, ça fait trop longtemps que tu as lancé la partie sans répondre, je stop là`,

    [s.SESSION_START]: g(
        t`Ok ${props => props.user}`,
        t`C'est parti ${props => props.user}`,
    ),
    [s.SESSION_INSTRUCTIONS]: g(
        t`Je vais te demander de noter 5 personnes sur 10`,
        t`Alors, je vais te demander de noter 5 personnes sur 10`,
    ),
    [s.SESSION_LETS_GO]: g(
        t`C'est parti !`,
        t`Ok, on y va !`,
    ),
    [s.SESSION_NEW_PERSON]: t`**${props => (props.i === 0 ? '1ère' : `${props.i + 1}ème`)} personnes (${props => props.name}) :**`,
    [s.SESSION_WAITING]: t`Alors ? :thinking:`,
    [s.SESSION_INVALID_RATE]: g(
        t`Ta note n'est pas valide`,
        t`Ta note n'est pas correcte`,
        t`Ta note doit être comprise entre 0 et 10`,
    ),
    [s.SESSION_VALID_RATE]: g(
        t`Ok`,
        t`C'est noté`,
    ),
    [s.SESSION_FINISH]: g(
        t`Merci d'avoir participé \nles notes sont: ${props => props.ratings.join(', ')}`,
        t`C'est fini\nles notes sont: ${props => props.ratings.join(', ')}\nn'hésite pas à taper \`${Settings.commandsPrefix} ${Settings.Commands.Rank}\` pour voir le classement`,
    ),
    [s.RANK_START]: t`Voila le top ${props => props.number}`,
    [s.RANK_START_REVERSE]: t`Voici le top ${props => props.number} inversé`,

    [s.HELP_TITLE]: t('Commandes disponiles :robot:'),
    [s.HELP]: t(`\n ឵឵
        :arrow_forward: **${Settings.commandsPrefix} ${Settings.Commands.Start}** - Lancer une notation de 5 meufs
        :octagonal_sign: **${Settings.commandsPrefix} ${Settings.Commands.Stop}** - Stoper la notation en cours
        :chart_with_downwards_trend: **${Settings.commandsPrefix} ${Settings.Commands.Rank} [reverse]** - Voir le top 10 des meilleurs ou des pires moeyennes
        :abc: **${Settings.commandsPrefix} ${Settings.Commands.Lang}** - Voir la liste des langues disponibles
        :speech_balloon: **${Settings.commandsPrefix} ${Settings.Commands.Lang} <language>** - Définir la langue
        :restroom: **${Settings.commandsPrefix} ${Settings.Commands.Gender}** - Voir la liste des genres disponibles
        :mens: **${Settings.commandsPrefix} ${Settings.Commands.Gender} <gender>** - Définir le genre
        :question: **${Settings.commandsPrefix} ${Settings.Commands.Help}** - Voir l'aide
        
        Les valeurs entre [crochets] sont optionels.
        Les valeurs entre <chevrons> doivent être fournis par vous.
    `)
};
