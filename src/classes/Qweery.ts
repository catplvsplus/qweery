import { Where } from './Where.js';

export class Qweery<T extends Qweery.Object> {
    protected readonly data: T[];

    constructor(data: Iterable<T>) {
        this.data = Array.from(data);
    }

    public query(options: {
        where?: Where.Options<T>;
        skip?: number;
        limit?: number;
    }): T[] {

        let result = new Where(this.data).filter(options.where || {});

        if (options.skip) {
            result = result.slice(options.skip);
        }

        if (options.limit) {
            result = result.slice(0, options.limit);
        }

        return result;
    }

    public where(options: Where.Options<T>): Qweery<T> {
        return new Qweery(new Where(this.data).filter(options || {}));
    }

    public skip(count: number): Qweery<T> {
        return new Qweery(this.data.slice(count));
    }

    public take(count: number): Qweery<T> {
        return new Qweery(this.data.slice(0, count));
    }

    public count(): number {
        return this.data.length;
    }

    public first(): T|undefined {
        return this.data[0];
    }

    public last(): T|undefined {
        return this.data[this.data.length - 1];
    }

    public toArray(): T[] {
        return this.data;
    }
}

export namespace Qweery {
    export type Object = object;
}