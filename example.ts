import { Qweery } from './src/index.js';

const data: {
    name: string;
    age: number;
    city: string;
    birthday: string;
}[] = await Bun.file(import.meta.dir + '/test/data.json').json();

const qweery = new Qweery(data);

console.log(
    qweery.query({
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
    })
);