import type { ValueOrArray } from '../helpers/types.js';

export class Qweery<T extends Qweery.Object> {
    public readonly data: T[];

    constructor(data: Iterable<T>) {
        this.data = Array.from(data);
    }

    public query(options: {
        where?: Qweery.WhereOptions<T>;
        skip?: number;
        limit?: number;
    }): T[] {
        let result = this.data.filter((_, index) => options.where ? this.isItemMatch(index, options.where) : true);

        if (options.skip) {
            result = result.slice(options.skip);
        }

        if (options.limit) {
            result = result.slice(0, options.limit);
        }

        return result;
    }

    public where(options: Qweery.WhereOptions<T>): Qweery<T> {
        return new Qweery(this.data.filter((_, index) => this.isItemMatch(index, options)));
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

    private isItemMatch(index: number, options: Qweery.WhereOptions<T>): boolean {
        const item = this.data.at(index);
        if (!item) return false

        const keys = Object.keys(options) as (keyof T)[];

        for (const key of keys) {
            if (key.toString().startsWith('$') || options[key] === undefined) continue;

            let value: boolean;

            if (typeof options[key] === 'function') {
                value = options[key](item[key], item, index, this.data);
            } else if (typeof options[key] === 'object') {
                if (typeof item[key] === 'string') {
                    value = this.evaluateStringOperator(
                        index,
                        key,
                        options[key] as Qweery.WhereOptionStringOperators<T, Qweery.StringPrimitive>
                    );
                } else if (
                    typeof item[key] === 'number' ||
                    typeof item[key] === 'bigint' ||
                    item[key] instanceof Date
                ) {
                    value = this.evaluateNumericalOperator(
                        index,
                        key,
                        options[key] as Qweery.WhereOptionNumericalOperators<T, Qweery.NumericalPrimitive>
                    );
                } else if (Array.isArray(item[key])) {
                    value = this.evaluateArrayOperator(
                        index,
                        key,
                        options[key] as Qweery.WhereOptionArrayOperators<T, Qweery.ArrayPrimitive>
                    );
                } else {
                    value = this.evaluateValueOperator(
                        index,
                        key,
                        options[key] as Qweery.WhereOptionValueOperators<T, any>
                    );
                }
            } else {
                value = item[key] === options[key];
            }

            if (!value) return false;
        }

        return this.evaluateLogicalOperator(index, options);
    }

    private evaluateLogicalOperator(index: number, options: Qweery.WhereOptionLogicalOperators<T>): boolean {
        let value = true;

        if (options.$NOT) {
            for (const option of  Array.isArray(options.$NOT) ? options.$NOT : [options.$NOT]) {
                if (this.isItemMatch(index, option)) return false;
            }
        }

        if (options.$AND) {
            for (const option of Array.isArray(options.$AND) ? options.$AND : [options.$AND]) {
                if (!this.isItemMatch(index, option)) return false;
            }
        }

        if (options.$OR) {
            let hasMatch = false;

            for (const option of Array.isArray( options.$OR) ?  options.$OR : [ options.$OR]) {
                if (this.isItemMatch(index, option)) {
                    hasMatch = true;
                    break;
                }
            }

            if (!hasMatch) return false;
        }

        return true;
    }

    private evaluateValueOperator(index: number, property: keyof T, operator: Qweery.WhereOptionValueOperators<T, any>): boolean {
        if ('equals' in operator && operator.equals !== this.data[index][property]) {
            return false;
        }

        if ('notEquals' in operator && operator.notEquals === this.data[index][property]) {
            return false;
        }

        return true && this.evaluateLogicalOperator(index, operator);
    }

    private evaluateNumericalOperator(index: number, property: keyof T, operator: Qweery.WhereOptionNumericalOperators<T, Qweery.NumericalPrimitive>): boolean {
        if (!this.evaluateValueOperator(index, property, operator)) return false;

        const value = Qweery.normalizeNumericalValue(this.data[index][property] as Qweery.NumericalPrimitive);

        if (operator.greaterThan !== undefined && !(value > Qweery.normalizeNumericalValue(operator.greaterThan))) {
            return false;
        }

        if (operator.greaterThanOrEqual !== undefined && !(value >= Qweery.normalizeNumericalValue(operator.greaterThanOrEqual))) {
            return false;
        }

        if (operator.lessThan !== undefined && !(value < Qweery.normalizeNumericalValue(operator.lessThan))) {
            return false;
        }

        if (operator.lessThanOrEqual !== undefined && !(value <= Qweery.normalizeNumericalValue(operator.lessThanOrEqual))) {
            return false;
        }

        return true;
    }

    private evaluateStringOperator(index: number, property: keyof T, operator: Qweery.WhereOptionStringOperators<T, Qweery.StringPrimitive>): boolean {
        if (!this.evaluateValueOperator(index, property, operator)) return false;

        let value = this.data[index][property] as Qweery.StringPrimitive;

        if (operator.caseInsensitive) {
            value = value.toLowerCase();
        }

        if (
            operator.includes &&
            !value.includes(
                operator.caseInsensitive
                ? operator.includes.toLowerCase()
                : operator.includes
            )
        ) {
            return false;
        }

        if (
            operator.startsWith && 
            !value.startsWith(
                operator.caseInsensitive
                    ? operator.startsWith.toLowerCase()
                    : operator.startsWith
            )
        ) {
            return false;
        }

        if (
            operator.endsWith &&
            !value.endsWith(
                operator.caseInsensitive
                    ? operator.endsWith.toLowerCase()
                    : operator.endsWith
            )
        ) {
            return false;
        }

        if (operator.matches && !operator.matches.test(value)) {
            return false;
        }

        return true;
    }

    private evaluateArrayOperator(index: number, property: keyof T, operator: Qweery.WhereOptionArrayOperators<T, Qweery.ArrayPrimitive>): boolean {
        if (!this.evaluateValueOperator(index, property, operator)) return false;

        const value = this.data[index][property] as Qweery.ArrayPrimitive;

        if ('includesEvery' in operator && operator.includesEvery?.every(v => value.includes(v))) {
            return true;
        }

        if ('includesSome' in operator && operator.includesSome?.some(v => value.includes(v))) {
            return true;
        }

        if ('includesNone' in operator && operator.includesNone?.every(v => !value.includes(v))) {
            return true;
        }

        return true;
    }
}

export namespace Qweery {
    export type Object = object;
    export type StringPrimitive = string;
    export type NumericalPrimitive = number|bigint|Date;
    export type ArrayPrimitive = Array<any>|ReadonlyArray<any>;

    export type WhereOptionKeys<T extends Object> = {
        [K in keyof T]?:
            |T[K]
            |((value: T[K], object: T, index: number, array: T[]) => boolean)
            |WhereOptionValueOperatorsType<T, T[K]>;
    }

    export type WhereOptionValueOperatorsType<T extends Object, V> = V extends StringPrimitive
        ? WhereOptionStringOperators<T, V>
        : V extends NumericalPrimitive
            ? WhereOptionNumericalOperators<T, V>
            : V extends ArrayPrimitive
                ? WhereOptionArrayOperators<T, V>
                : WhereOptionValueOperators<T, V>

    export interface WhereOptionLogicalOperators<T extends Object> {
        $AND?: ValueOrArray<WhereOptions<T>>;
        $OR?: ValueOrArray<WhereOptions<T>>;
        $NOT?: ValueOrArray<WhereOptions<T>>;
    }

    export interface WhereOptionValueOperators<T extends Object, V> extends WhereOptionLogicalOperators<T> {
        equals?: V;
        notEquals?: V;
    }

    export interface WhereOptionNumericalOperators<T extends Object, V extends NumericalPrimitive> extends WhereOptionValueOperators<T, V> {
        greaterThan?: V;
        greaterThanOrEqual?: V;
        lessThan?: V;
        lessThanOrEqual?: V;
    }

    export interface WhereOptionStringOperators<T extends Object, V extends StringPrimitive> extends WhereOptionValueOperators<T, V> {
        includes?: V;
        startsWith?: V;
        endsWith?: V;
        caseInsensitive?: boolean;
        matches?: RegExp;
    }

    export interface WhereOptionArrayOperators<T extends Object, V extends ArrayPrimitive> extends WhereOptionValueOperators<T, V> {
        includesEvery?: V[number][];
        includesSome?: V[number][];
        includesNone?: V[number][];
    }

    export type WhereOptions<T extends Object> = WhereOptionKeys<T> & WhereOptionLogicalOperators<T>;

    export function normalizeNumericalValue(value: Qweery.NumericalPrimitive): number|bigint {
        return value instanceof Date ? value.getTime() : value;
    }
}