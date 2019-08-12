import Person from "../Person";
import Gender from "../Gender";

export default abstract class AbstractPersonProvider {
    public abstract async getRandom(gender: Gender): Promise<Person>;
}
