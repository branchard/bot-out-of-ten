import Person from "../Person";

export default abstract class AbstractPersonProvider {
    public abstract async getRandom(): Promise<Person>;
}

