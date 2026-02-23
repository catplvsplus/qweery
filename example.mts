
import { Qweery } from './src/classes/Qweery.js';

const qweery = new Qweery([
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 },
    { name: 'David', age: 28 },
]);

console.log(
    qweery
        // name.includes('a') || age > 30
        .query({
            where: {
                name: {
                    includes: 'a'
                },
                $OR: {
                    age: { greaterThan: 30 }
                }
            },
            skip: 1,
            take: 2,
        })
);