import { Where } from './Where.js';

export class Qweery<T extends Qweery.Object> {
    protected readonly data: T[];

    constructor(data: Iterable<T>) {
        this.data = Array.from(data);
    }

    public query<K extends keyof T>(options: {
        select?: K[];
        where?: Where.Options<Pick<T, K>>;
        skip?: number;
        take?: number;
    }): Pick<T, K>[] {

        let result = new Where<Pick<T, K>>(this.data).filter(options.where || {});

        if (options.skip) {
            result = result.slice(options.skip);
        }

        if (options.take) {
            result = result.slice(0, options.take);
        }

        if (options.select?.length) {
            result = result.map(
                item => options.select!.reduce((acc, key) => {
                    acc[key] = item[key];
                    return acc;
                }, {} as Pick<T, K>)
            );
        }

        return result;
    }

    public select<K extends keyof T>(...keys: K[]): Qweery<Pick<T, K>> {
        return new Qweery(
            keys.length
            ? this.data.map(
                item => keys.reduce((acc, key) => {
                    acc[key] = item[key];
                    return acc;
                }, {} as Pick<T, K>)
            )
            : this.data
        );
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