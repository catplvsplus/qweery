# qweery

A simple type-safe ORM like query builder for structured arrays

## Installation

```bash
npm install qweery
```

## Highlights
- Typescript first design, ensuring type safety and autocompletion.
- Very familiar API.
- Zero dependencies.
- Fast? Not really.

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

### Basic Operators

#### `$AND` Operator

**Filters items that match all conditions in the `$AND` operator**. All fields that are not operators are AND'ed together.

```typescript
console.log(
    qweery
        // name == 'Alice' && age > 30
        .where({
            name: 'Alice',
            age: { greaterThan: 30 }
        })
        // can also be written as
        .where({
            $AND: [
                { name: 'Alice' },
                { age: { greaterThan: 30 } }
            ]
        })
        .skip(0)
        .take(10)
        .all()
);

// Output: []
```

#### `$OR` Operator

**Filters items that match at least one of the conditions in the `$OR` operator.** All conditions in the `$OR` operator will be OR'ed together.
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
        .all()
);

// Output: [{ name: 'Alice', age: 30 }, { name: 'Charlie', age: 35 }]
```

If an `$OR` operator is an array, all conditions in the array will be evaluated together, then AND'ed with the previous condition.

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
        .all()
);

// Output: [{ name: 'Charlie', age: 35 }]
```

If an `$OR` operator is not an array, it will be OR'ed with the previous condition.
```typescript
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
        .all()
);

// Output: [{ name: 'Charlie', age: 35 }, { name: 'David', age: 28 }]
```

#### `$NOT` Operator

Used to negate a condition. **If the condition is false, the item will be returned.**

```typescript
console.log(
    qweery
        // name != 'Alice'
        .where({
            $NOT: [
                { name: 'Alice' }
            ]
        })
        .skip(0)
        .take(10)
        .all()
);

// Output: [{ name: 'Bob', age: 25 }, { name: 'Charlie', age: 35 }, { name: 'David', age: 28 }]
```

#### Function Filter

You can use a function that returns a boolean to filter a values of a field.
```typescript
console.log(
    qweery
        // name.toLowerCase().includes('a')
        .where({
            name: value => value.toLowerCase().includes('a')
        })
        .skip(0)
        .take(10)
        .all()
);

// Output: [{ name: 'Alice', age: 30 }, { name: 'Charlie', age: 35 }, { name: 'David', age: 28 }]
```

### Nested Operators

All operators can be nested.
```typescript
console.log(
    qweery
        // name == 'Alice' || (name != 'Bob' && (age > 28 || age < 28))
        .where({
            name: 'Alice',
            $OR: [
                {
                    $NOT: [
                        { name: 'Bob' }
                    ],
                    $OR: [
                        { age: { greaterThan: 28 } },
                        { age: { lessThan: 28 } }
                    ]
                }
            ]
        })
);
```