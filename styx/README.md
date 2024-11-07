# Mythics' Styx

**Styx** is tiny experiment in Typescript around promises.
**Styx** proposes 2 promise-like implementations:
* PendingPromise
* EndlessPromise

## The PendingPromise pattern

I met this case many times: in a function, we return a promise that we don't know when it will be resolved.
We do not even have code in it. It is not simply async, it just gonna be resolved later in the code.
So, we save the promise's resolve and reject functions to call them later.

PendingPromise is just a promise-like class, using native promises, and attaching resolve and reject methods,
instead of being construct with a callback argument. With a PendingPromise, you can just create a promise without
code in it and resolve ou reject it later in your code.

### Example:
```
import { PendingPromise } from "mythics/styx";

const promise = new PendingPromise();

promise
    .then((x) => {
        console.log('Result: ' + x);
    });
    
promise.resolve('Hello world');
```

## The EndlessPromise pattern

There is no usecase for the EndlessPromise. 
I just wondered :

>*Is it possible to create a promise-like implementation that act exactly like a real promise,
but never completes, and emits many values during his lifecycle ?*

It is a nonsense by definition. The purpose and the specification of a promise is NOT adapted to emit multiple values.
But once I ask a question myself, it becomes an enigma to solve. So, it is a weird piece of code, using native promises,
and it seems to works. It was just fun.

Play with it if you like to. But **NEVER** use it in a real project!

### Example:
```
import { EndlessPromise } from "mythics/styx";

const promise = new EndlessPromise((resolve, reject) => {
    let x = 0;
    resolve(x++);
    setInterval(() => resolve(x++), 1000);
});

promise
    .then((x) => {
        console.log('Count: ' + x);
    });
```

---

## Why call it "Styx" ?

In Greek mythology, [Styx was the oath of the gods](https://en.wikipedia.org/wiki/Styx).
I do not find the divinity of promises, so the goddess of oath seems fine.