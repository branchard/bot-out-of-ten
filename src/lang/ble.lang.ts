import Settings from '../Settings';
import {t, g, s} from './index';
import {settings} from "cluster";

export default {
    [s.SUCCESSFULLY_STOP]: g(
        t`Ok ${props => props.user} je stop là <:serieux:570361303483285524>`,
        t`Ok ${props => props.user} j'arrète là <:serieux:570361303483285524>`,
        t`Ok blé ${props => props.user} je stop là <:serieux:570361303483285524>`,
        t`Ok blé ${props => props.user} j'arrète là <:serieux:570361303483285524>`,
        t`Ok blaient ${props => props.user} j'arrète là <:serieux:570361303483285524>`,
    ),
    [s.WRONG_USER_STOP]: g(
        t`${props => props.user} tu vas rien stopper mon garçon <:serieux:570361303483285524>`,
        t`${props => props.user} tu vas rien stopper du tout <:serieux:570361303483285524>`,
        t`${props => props.user} tu vas rien stopper, j'vais t'faire courire moi <:serieux:570361303483285524>`,
    ),
    [s.SELF_START_ANOTHER_SESSION]: g(
        t`Blé tu te fous de ma gueule <:serieux:570361303483285524>`,
        t`Heu blé tu te fous de ma gueule <:serieux:570361303483285524>`,
        t`Non mais sérieux, tu te fous de ma gueule <:serieux:570361303483285524>`,
        t`${props => props.user} tu te fous de ma gueule <:serieux:570361303483285524>`,
        t`${props => props.user}, je pense que tu te fous de ma gueule <:serieux:570361303483285524>`
    ),
    [s.START_ANOTHER_SESSION]: g(
        t`Blé je termine avec ${props => props.user} <:serieux:570361303483285524>`,
        t`Blaient je termine avec ${props => props.user} <:serieux:570361303483285524>`,
        t`Blaient j'ai pas fini avec ${props => props.user} <:serieux:570361303483285524>`,
        t`Blef j'ai pas fini avec ${props => props.user} <:serieux:570361303483285524>`,
        t`Blé tu ne vois pas que tu nous dérange <:serieux:570361303483285524>`,
    ),
    [s.SESSION_TIMEOUT]: t`Blé ${props => props.user}, j'en ai mare d'attendre, j'arrête là <:serieux:570361303483285524>`,

    [s.SESSION_START]: g(
        t`Ok blé ${props => props.user}`,
        t`Ok blaient ${props => props.user}`,
        t`Ok ${props => props.user}`,
        t`Prépare toi ${props => props.user}`,
        t`Prépare toi blaient ${props => props.user}`,
        t`C'est parti ${props => props.user}`,
    ),
    [s.SESSION_INSTRUCTIONS]: g(
        t`Je vais te demander de noter 5 meufs sur 10`,
        t`Alors, je vais te demander de noter 5 meufs sur 10`,
        t`Blé, tu dois noter 5 meufs sur 10`,
        t`Blaient, tu dois noter 5 meufs sur 10`,
        t`Blé, tu vas devoir noter 5 meufs sur 10`,
    ),
    [s.SESSION_LETS_GO]: g(
        t`C'est parti`,
        t`C'est parti blé`,
        t`Ok, on y va blé`,
        t`C'est parti blaient`,
        t`Ok, on y va blaient`,
    ),
    [s.SESSION_NEW_PERSON]: g(
        t`**${props => (props.i === 0 ? '1ère' : `${props.i + 1}ème`)} meuf (${props => props.name}) :**`,
        t`**${props => (props.i === 0 ? '1ère' : `${props.i + 1}ème`)} meuf blé (${props => props.name}) :**`,
        t`**${props => (props.i === 0 ? '1ère' : `${props.i + 1}ème`)} meuf blaient (${props => props.name}) :**`,
    ),
    [s.SESSION_WAITING]: g(
        t`Alors blé ? :thinking:`,
        t`Alors ? :thinking:`,
        t`Alors blaient ? :thinking:`,
        t`Hop hop hop, on attend la note :thinking:`,
    ),
    [s.SESSION_INVALID_RATE]: g(
        t`Blé ta note n'est pas valident`,
        t`Blaient ta note n'est pas valident`,
        t`Ta note n'est pas correcte`,
        t`Ta note doit être en 0 et 10`,
        t`Blé c'est quoi ta note là ?`,
        t`Mais gros ! C'est quoi ta note là !`,
    ),
    [s.SESSION_VALID_RATE]: g(
        t`Ok blé`,
        t`C'est noté`,
        t`C'est noté blé`,
        t`Ok blaient`,
        t`C'est noté blef`,
        t`C'est noté blaient`,
    ),
    [s.SESSION_FINISH]: g(
        t`Merci d'avoir participé blé\nles notes sont: ${props => props.ratings.join(', ')}`,
        t`C'est fini blé\nles notes sont: ${props => props.ratings.join(', ')}`,
        t`C'est fini blé\nles notes sont: ${props => props.ratings.join(', ')}\nn'hésite pas à taper \`${Settings.commandsPrefix} ${Settings.Commands.Rank}\` pour voir le classement`,
    ),
    [s.RANK_START]: t`Voila les ${props => props.number} meufs certifié without vergogneless par les bléenfts`,
    [s.RANK_START_REVERSE]: t`Voici les ${props => props.number} meufs qu'aucun bléentfs n'oserai toucher du regard même avec une combinaison à travers la vitre d'une quarantaine ou se trouverai la dite meuf`
};
