import { Qweery } from './src/index.js';

const qweery = new Qweery([
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 },
    { name: 'David', age: 28 },
]);

console.log(
    qweery
        // name == 'Alice' || age > 30
        .where({
            $OR: [
                { name: 'Alice' },
                { age: { greaterThan: 30 } }
            ]
        })
        .skip(0)
        .take(10)
        .toArray()
); // Output: [{ name: 'Alice', age: 30 }, { name: 'Charlie', age: 35 }]

console.log(
    qweery
        // name == 'Alice' && age > 30
        .where({
            name: 'Alice',
            age: { greaterThan: 30 }
        })
        .skip(0)
        .take(10)
        .toArray()
); // Output: []

console.log(
    qweery
        // name.includes('a') && (age > 28 || age < 28)
        .where({
            name: {
                includes: 'a'
            },
            $OR: [
                { age: { greaterThan: 28 } },
                { age: { lessThan: 28 } }
            ]
        })
        .skip(0)
        .take(10)
        .toArray()
); // Output: [{ name: 'Charlie', age: 35 }]