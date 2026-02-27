import { Where } from './Where.js';

export class Qweery<T extends Qweery.Object> {
    protected readonly data: T[];

    constructor(data: Iterable<T>) {
        this.data = Array.from(data);
    }

    /**
     * Query data based on options
     * @param options The query options
     * @returns An array of filtered data
     */
    public query<K extends keyof T>(options: {
        select?: K[];
        where?: Where.Options<Pick<T, K>>;
        skip?: number;
        take?: number;
    }): Pick<T, K>[] {

        let result = Where.filter<Pick<T, K>>(this.data, options.where || {});

        result = result.slice(
            options.skip ?? 0,
            options.take ? (options.skip ?? 0) + options.take : undefined
        );

        if (options.select?.length) {
            result = result.map(item => {
                if (!options.select?.length) {
                    return item;
                }

                const newItem = {} as Pick<T, K>;

                for (const key of options.select) {
                    newItem[key] = item[key];
                }

                return newItem;
            });
        }

        return result;
    }

    /**
     * Select only certain keys from the result data
     * @param keys The keys to select
     * @returns A new Qweery instance with the result data
     */
    public select<K extends keyof T>(...keys: K[]): Qweery<Pick<T, K>> {
        return new Qweery(
            keys.length
            ? this.data.map(item => {
                if (!keys?.length) {
                    return item;
                }

                const newItem = {} as Pick<T, K>;

                for (const key of keys) {
                    newItem[key] = item[key];
                }

                return newItem;
            })
            : this.data
        );
    }

    /**
     * Filter the data with the given conditions
     * @param options The filter conditions
     * @returns A new Qweery instance with the filtered data
     */
    public where(options: Where.Options<T>): Qweery<T> {
        return new Qweery(Where.filter(this.data, options || {}));
    }

    /**
     * Skip a certain amount of data
     * @param count The amount of data to skip
     * @returns A new Qweery instance with the skipped results
     */
    public skip(count: number): Qweery<T> {
        return new Qweery(this.data.slice(count));
    }

    /**
     * Take a certain amount of data
     * @param count The amount of data to take
     * @returns A new Qweery instance with the taken results
     */
    public take(count: number): Qweery<T> {
        return new Qweery(this.data.slice(0, count));
    }

    /**
     * Get the length of the results
     * @returns The length of the results
     */
    public count(): number {
        return this.data.length;
    }

    /**
     * Get the first result
     * @returns The first result or null if there are no results
     */
    public first(): T|null {
        return this.data[0] ?? null;
    }

    /**
     * Get the last result
     * @returns The last result or null if there are no results
     */
    public last(): T|null {
        return this.data[this.data.length - 1] ?? null;
    }

    /**
     * Get all results
     * @returns The results
     */
    public all(): T[] {
        return this.data;
    }
}

export namespace Qweery {
    export type Object = object;
}