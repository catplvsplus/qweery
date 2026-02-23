import type { ValueOrArray } from '../helpers/types.js';
import { Primitive } from './Primitive.js';
import type { Qweery } from './Qweery.js';

export class Where<T extends Qweery.Object> {
    public readonly data: T[];

    public constructor(data: Iterable<T>) {
        this.data = Array.from(data);
    }

    public filter(options: Where.Options<T>): T[] {
        return this.data.filter((_, index) => this.satisfiesItem(options, index));
    }

    public satisfiesItem(options: Where.Options<T>, index: number): boolean {
        const item = this.data.at(index);
        if (!item) return false;

        let value = true;

        for (const key in options) {
            if (Where.isLogicalOperator(key)) {
                const conditions = options[key as keyof T] as ValueOrArray<Where.Options<T>>;

                switch (key) {
                    case '$NOT':
                        value = value && !(
                            Array.isArray(conditions)
                                ? conditions.every(condition => this.satisfiesItem(condition, index))
                                : this.satisfiesItem(conditions, index)
                        );
                        break;
                    case '$AND':
                        value = value && (
                            Array.isArray(conditions)
                                ? conditions.every(condition => this.satisfiesItem(condition, index))
                                : this.satisfiesItem(conditions, index)
                        );
                        break;
                    case '$OR':
                        value = Array.isArray(conditions)
                            ? value && conditions.some(condition => this.satisfiesItem(condition, index))
                            : value || this.satisfiesItem(conditions, index);
                        break;
                }

                continue;
            }


            const filter = options[key as keyof T] as Where.Filter<T, keyof T>;
            const itemValue = item[key as keyof T];

            if (filter instanceof Function) {
                value = value && filter(itemValue, item, index, this.data);
                continue;
            }

            if (typeof filter === 'object') {
                if (typeof itemValue === 'string') {
                    value = value && Primitive.statisfiesString(itemValue, filter as Primitive.StringFilters<Primitive.String>);
                    continue;
                }

                if (Array.isArray(itemValue)) {
                    value = value && Primitive.statisfiesArray(itemValue, filter as Primitive.ArrayFilters<Primitive.Array>);
                    continue;
                }

                if (Primitive.isNumerical(itemValue)) {
                    value = value && Primitive.statisfiesNumerical(itemValue, filter as Primitive.NumericalFilters<Primitive.Numerical>);
                    continue;
                }

                value = value && Primitive.satisfiesValue(itemValue, filter as Primitive.Filters<any>);
                continue;
            }

            value = value && (itemValue === filter);
        }

        return value;
    }
}

export namespace Where {
    export type KeyFilters<T extends Qweery.Object> = {
        [K in keyof T]?: Filter<T, K>;
    }

    export type Filter<T extends Qweery.Object, K extends keyof T> = 
        |T[K]
        |((value: T[K], object: T, index: number, array: T[]) => boolean)
        |(Primitive.FilterType<T[K]> & LogicalOperators<T>)

    export interface LogicalOperators<T extends Qweery.Object> extends Partial<Record<'$AND'|'$OR'|'$NOT', ValueOrArray<Options<T>>>>{
        //
    }

    export type Options<T extends Qweery.Object> = KeyFilters<T> & LogicalOperators<T>;

    export function isLogicalOperator(value: unknown): value is keyof LogicalOperators<any> {
        return value === '$AND' || value === '$OR' || value === '$NOT';
    }
}

const w = new Where([
    { name: 'Alice', age: 30, sports: ['Football', 'Basketball'] },
    { name: 'Bob', age: 25, sports: ['Football', 'Basketball'] },
    { name: 'Charlie', age: 35, sports: ['Football', 'Basketball'] }
]);