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
        t`C'est fini\nles notes sont: ${props => props.ratings.join(', ')}\nn'hésite pas à taper \`!bot rank\` pour voir le classement`,
    ),
};
