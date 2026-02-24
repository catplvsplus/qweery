import { describe, expect, it } from 'bun:test';
import { Qweery } from '../src/index.js';

const data: {
    name: string;
    age: number;
    city: string;
    birthday: string;
}[] = await Bun.file(import.meta.dir + '/data.json').json();

const qweery = new Qweery(data);

describe('query', () => {
    it('should return 3 results for names starting with A and age less than 50', () => {
        const results = qweery.query({
            where: {
                name: {
                    startsWith: 'A'
                },
                age: {
                    lessThan: 100
                }
            }
        });

        const expected = data.filter((item) => {
            return (
                item.name.startsWith('A') &&
                item.age < 100
            );
        });

        expect(results).toEqual(expected);
    });

    it('should return results for OR condition of name starting with A or age less than 50', () => {
        const results = qweery.query({
            where: {
                $OR: [
                    {
                        name: {
                            startsWith: 'A'
                        }
                    },
                    {
                        age: {
                            lessThan: 50
                        }
                    }
                ]
            }
        });

        const expected = qweery.all().filter((item) => {
            return (
                item.name.startsWith('A') ||
                item.age < 50
            );
        });

        expect(results).toEqual(expected);
    });

    it('should return results for NOT condition of name starting with A and age less than 50', () => {
        const results = qweery.query({
            where: {
                $NOT: {
                    name: {
                        startsWith: 'A'
                    },
                    $OR: {
                        age: {
                            lessThan: 100
                        }
                    }
                }
            }
        });

        const expected = qweery.all().filter((item) => {
            return !(
                item.name.startsWith('A') ||
                item.age < 100
            );
        });

        expect(results).toEqual(expected);
    });

    it('should return results with name fields only', () => {
        const results = qweery.query({
            select: ['name']
        });

        expect(results).toEqual(data.map(item => ({ name: item.name })));
    });
});