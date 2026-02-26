export class Primitive {
    private constructor() {}

    public static satisfiesValue<T>(value: T, options: Primitive.Filters<T>): boolean {
        if (Primitive.isDefined(options.equals) && value !== options.equals) {
            return false;
        }

        if (Primitive.isDefined(options.notEquals) && value === options.notEquals) {
            return false;
        }

        return true;
    }

    public static statisfiesString(value: Primitive.String, options: Primitive.StringFilters<Primitive.String>): boolean {
        if (options.caseInsensitive) value = value.toLowerCase();

        if (!this.satisfiesValue(value, options)) {
            return false;
        }

        if (Primitive.isDefined(options.startsWith) && !value.startsWith(options.startsWith)) {
            return false;
        }

        if (Primitive.isDefined(options.endsWith) && !value.endsWith(options.endsWith)) {
            return false;
        }

        if (Primitive.isDefined(options.includes) && !value.includes(options.includes)) {
            return false;
        }

        if (Primitive.isDefined(options.matches) && !options.matches.test(value)) {
            return false;
        }

        return true;
    }

    public static statisfiesNumerical(value: Primitive.Numerical, options: Primitive.NumericalFilters<Primitive.Numerical>): boolean {
        value = Primitive.normalizeNumericalValue(value);

        if (Primitive.isDefined(options.equals) && value !== Primitive.normalizeNumericalValue(options.equals)) {
            return false;
        }

        if (Primitive.isDefined(options.notEquals) && value === Primitive.normalizeNumericalValue(options.notEquals)) {
            return false;
        }

        if (Primitive.isDefined(options.greaterThan) && value <= Primitive.normalizeNumericalValue(options.greaterThan)) {
            return false;
        }

        if (Primitive.isDefined(options.greaterThanOrEqual) && value < Primitive.normalizeNumericalValue(options.greaterThanOrEqual)) {
            return false;
        }

        if (Primitive.isDefined(options.lessThan) && value >= Primitive.normalizeNumericalValue(options.lessThan)) {
            return false;
        }

        if (Primitive.isDefined(options.lessThanOrEqual) && value > Primitive.normalizeNumericalValue(options.lessThanOrEqual)) {
            return false;
        }

        return true;
    }

    public static statisfiesArray(value: Primitive.Array, options: Primitive.ArrayFilters<Primitive.Array>): boolean {
        if (!this.satisfiesValue(value, options)) {
            return false;
        }

        if (Primitive.isDefined(options.includesEvery) && !options.includesEvery.every(item => value.includes(item))) {
            return false;
        }

        if (Primitive.isDefined(options.includesSome) && !options.includesSome.some(item => value.includes(item))) {
            return false;
        }

        if (Primitive.isDefined(options.includesNone) && options.includesNone.some(item => value.includes(item))) {
            return false;
        }

        if (Primitive.isDefined(options.length) && !Primitive.statisfiesNumerical(value.length, options.length)) {
            return false;
        }

        return true;
    }
}

export namespace Primitive {
    export function normalizeNumericalValue(value: Primitive.Numerical): number|bigint {
        return value instanceof Date ? value.getTime() : value;
    }

    export function isNumerical(value: unknown): value is Primitive.Numerical {
        return typeof value === 'number' || typeof value === 'bigint' || value instanceof Date;
    }

    export function isDefined<T>(value: T): value is Exclude<T, undefined> {
        return value !== undefined;
    }

    export type String = string;
    export type Numerical = number|bigint|Date;
    export type Array = any[]|readonly any[];

    export type FilterType<V> = V extends String
        ? StringFilters<V>
        : V extends Numerical
            ? NumericalFilters<V>
            : V extends Array
                ? ArrayFilters<V>
                : Filters<V>;

    export interface Filters<V>{
        equals?: V;
        notEquals?: V;
    }

    export interface NumericalFilters<V extends Numerical> extends Filters<V> {
        greaterThan?: V;
        greaterThanOrEqual?: V;
        lessThan?: V;
        lessThanOrEqual?: V;
    }

    export interface StringFilters<V extends String> extends Filters<V> {
        includes?: V;
        startsWith?: V;
        endsWith?: V;
        caseInsensitive?: boolean;
        matches?: RegExp;
    }

    export interface ArrayFilters<V extends Array> extends Filters<V> {
        includesEvery?: V[number][];
        includesSome?: V[number][];
        includesNone?: V[number][];
        length?: NumericalFilters<number>;
    }
}