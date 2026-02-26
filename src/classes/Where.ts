import type { ValueOrArray } from '../helpers/types.js';
import { Primitive } from './Primitive.js';
import type { Qweery } from './Qweery.js';

export class Where<T extends Qweery.Object> {
    private constructor() {}

    public static filter<T extends Qweery.Object>(data: Iterable<T>, where: Where.Options<T>): T[] {
        const items = Array.isArray(data) ? data : Array.from(data);
        const result = [];

        for (let i = 0; i < items.length; i++) {
            if (Where.satisfiesItem(where, items, i)) {
                result.push(items[i]);
            }
        }

        return result;
    }

    public static satisfiesItem<T extends Qweery.Object>(options: Where.Options<T>, items: T[], index: number): boolean {
        const item = items[index];
        if (!item) return false;

        let value = true;

        for (const key in options) {
            if (Where.isLogicalOperator(key)) {
                value = Where.evaluateLogicalOperators({
                    currentBooleanValue: value,
                    items,
                    index,
                    operator: key,
                    conditions: options[key as keyof T] as ValueOrArray<Where.Options<T>>
                });

                continue;
            }


            value = Where.evaluateValueFilters({
                currentBooleanValue: value,
                items,
                index,
                key: key as keyof T,
                filter: options[key as keyof T] as Where.Filter<T, keyof T>
            });
        }

        return value;
    }

    public static evaluateValueFilters<T extends Qweery.Object>(options: {
        currentBooleanValue: boolean;
        items: T[];
        index: number;
        key: keyof T;
        filter: Where.Filter<T, keyof T>;
    }): boolean {
        const value = options.currentBooleanValue;
        const item = options.items[options.index];
        const itemValue = item[options.key];

        if (options.filter && Where.isFunctionFilter<T, keyof T>(options.filter)) {
            return value && options.filter(itemValue, item, options.index, options.items);
        }

        if (typeof options.filter === 'object') {
            if (typeof itemValue === 'string') {
                return value && Primitive.statisfiesString(itemValue, options.filter as Primitive.StringFilters<Primitive.String>);
            }

            if (Array.isArray(itemValue)) {
                return value && Primitive.statisfiesArray(itemValue, options.filter as Primitive.ArrayFilters<Primitive.Array>);
            }

            if (Primitive.isNumerical(itemValue)) {
                return value && Primitive.statisfiesNumerical(itemValue, options.filter as Primitive.NumericalFilters<Primitive.Numerical>);
            }

            return value && Primitive.satisfiesValue(itemValue, options.filter as Primitive.Filters<any>);
        }

        return value && (itemValue === options.filter);
    }

    public static evaluateLogicalOperators<T extends Qweery.Object>(options: {
        currentBooleanValue: boolean;
        items: T[];
        index: number;
        operator: keyof Where.LogicalOperators<T>;
        conditions: ValueOrArray<Where.Options<T>>;
    }): boolean {
        let value = options.currentBooleanValue;

        switch (options.operator) {
            case '$NOT':
                value = value && !(
                    Array.isArray(options.conditions)
                        ? options.conditions.every(condition => Where.satisfiesItem(condition, options.items, options.index))
                        : Where.satisfiesItem(options.conditions, options.items, options.index)
                );
                break;
            case '$AND':
                value = value && (
                    Array.isArray(options.conditions)
                        ? options.conditions.every(condition => Where.satisfiesItem(condition, options.items, options.index))
                        : Where.satisfiesItem(options.conditions, options.items, options.index)
                );
                break;
            case '$OR':
                value = Array.isArray(options.conditions)
                    ? value && options.conditions.some(condition => Where.satisfiesItem(condition, options.items, options.index))
                    : value || Where.satisfiesItem(options.conditions, options.items, options.index);
                break;
        }

        return value;
    }
}

export namespace Where {
    export type FunctionFilter<T extends Qweery.Object, K extends keyof T> = (value: T[K], object: T, index: number, array: T[]) => boolean;

    export type Filter<T extends Qweery.Object, K extends keyof T> =
        |T[K]
        |FunctionFilter<T, K>
        |(Primitive.FilterType<T[K]> & LogicalOperators<T>);


    export type KeyFilters<T extends Qweery.Object> = {
        [K in keyof T]?: Filter<T, K>;
    }

    export interface LogicalOperators<T extends Qweery.Object> extends Partial<Record<'$AND'|'$OR'|'$NOT', ValueOrArray<Options<T>>>> {
        //
    }

    export type Options<T extends Qweery.Object> = KeyFilters<T> & LogicalOperators<T>;

    export function isLogicalOperator(value: unknown): value is keyof LogicalOperators<any> {
        return value === '$AND' || value === '$OR' || value === '$NOT';
    }

    export function isFunctionFilter<T extends Qweery.Object, K extends keyof T>(value: unknown): value is FunctionFilter<T, K> {
        return typeof value === 'function';
    }
}