
import { Qweery } from 'qweery';

const qweery = new Qweery([
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 },
    { name: 'David', age: 28 },
]);

console.log(
    qweery
        // name.includes('a') || age > 30
        .where({
            name: {
                includes: 'a'
            },
            $OR: {
                age: { greaterThan: 30 }
            }
        })
        .skip(0)
        .take(10)
        .toArray()
);