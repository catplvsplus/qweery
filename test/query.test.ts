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
                    lessThan: 50
                }
            }
        });

        expect(results).toBeArrayOfSize(3);

        for (const result of results) {
            expect(result.name).toStartWith('A');
            expect(result.age).toBeLessThan(50);
        }
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

        for (const result of results) {
            const nameStartsWithA = result.name.startsWith('A');
            const ageLessThan50 = result.age < 50;

            expect(nameStartsWithA || ageLessThan50).toBeTrue();
        }
    });
});