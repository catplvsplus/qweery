# qweery

A simple type-safe ORM like query builder for structured arrays

## Installation

```bash
npm install qweery
```

## Highlights
- Typescript first design, ensuring type safety and autocompletion.
- ORM-like querying.
- Chainable API for building complex queries.
- Fast? I don't really know.

## Usage

```typescript
import { Qweery } from 'qweery';

const qweery = new Qweery([
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 },
    { name: 'David', age: 28 },
]);
```

### Basic Queries

```typescript
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
);

// Output: []
```

```typescript
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
);

// Output: [{ name: 'Alice', age: 30 }, { name: 'Charlie', age: 35 }]
```

```typescript
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
);

// Output: [{ name: 'Charlie', age: 35 }]
```