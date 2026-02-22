import { Qweery } from './src/index.js';

const data: {
    name: string;
    age: number;
    city: string;
    birthday: Date;
}[] = await Bun.file('./data.json').json();

const qweery = new Qweery(data);

console.log(
    qweery.query({
        where: {
            name: {
                includes: 'a'
            }
        },
        skip: 2,
        limit: 3
    })
);