# onceupon.js v1.4.0

Custom event system for JavaScript exported as [Node.js](https://nodejs.org) module.

[![npm](https://img.shields.io/npm/v/onceupon.js)](https://www.npmjs.com/package/onceupon.js)
[![npm bundle size](https://img.shields.io/bundlephobia/min/onceupon.js)](https://www.npmjs.com/package/onceupon.js)
[![npm](https://img.shields.io/npm/dm/onceupon.js)](https://www.npmjs.com/package/onceupon.js)

```javascript
let onceupon = require('onceupon.js')();

onceupon.on('event', (data) => {
    console.log(data);
    // data
});

onceupon.fire('event', 'data');
```

## Installation
Install using [NPM](https://npmjs.org):

```
$ npm i -g npm
$ npm i --save onceupon.js
```

In Node.js:

```javascript
// Require onceupon & create a new instance
let onceupon = require('onceupon.js')();
```

## API
### onceupon(object)

- `object` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

Require `onceupon` & create a new instance.

```javascript
let onceupon = require('onceupon.js')();
```

Assign `onceupon` object to an existing one.

```javascript
let data = {};

let onceupon = require('onceupon.js')(data);
// Merge onceupon & data object
```

### .create(event)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

Optionally, an event with any name can be created.

```javascript
onceupon.create('name');
```

### .on(event, callback, last)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `data` &lt;Any&gt;
    - `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `last` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)


The callback is executed each time the event is fired.
There is a possible argument for the data from the `fire` function. If there are several arguments at the event call, `data` is an array.

```javascript
onceupon.on('name', (data) => {
    // Event is fired, callback executed
    // Use transmitted data
    console.log(data);
});
```

If the argument `last` is set to `true`, the listener does not execute event calls from before the initialization of the listener.

```javascript
// Fire event before the initialization of .on()
// This event call is not executed
onceupon.fire('event', 'before');

setTimeout(() => {
    onceupon.on('event', data => {
        console.log(data);
        // OUTPUT: after
        // OUTPUT: another call
    }, true);

    onceupon.fire('event', 'after');
    onceupon.fire('event', 'another call');
}, 1000);
```

#### Multiple events
It is also possible to use a callback for several events. For this purpose, the events names can be separated by a `|`.

```javascript
// Listen to the events 'first' and 'second'
onceupon.on('first|second', () => {
    // Event 'first' or 'second' is fired, callback executed
});
```

### .once(event, callback, last)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `data` &lt;Any&gt;
    - `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `last` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

The callback is executed only once when the event is first called.
There is a possible argument for the data from the `fire` function. If there are several arguments at the event call, `data` is an array.

```javascript
onceupon.once('name', (data) => {
    // Event is fired, callback executed
    // Use transmitted data
    console.log(data);
});
```

If the argument `last` is set to `true`, the listener does not execute event calls from before the initialization of the listener.

```javascript
// Fire event before the initialization of .once()
// This event call is not executed
onceupon.fire('event', 'before');

// Set a timeout
setTimeout(() => {
    onceupon.once('event', data => {
        console.log(data);
        // OUTPUT: after
    }, true);

    onceupon.fire('event', 'after');
}, 1000);
```

#### Multiple events
It is also possible to use a callback for several events. For this purpose, the events names can be separated by a `|`.

```javascript
// Listen to the events 'first' and 'second'
onceupon.once('first|second', () => {
    // Event 'first' or 'second' is fired, callback executed
});
```

### .fire(event, data)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `data` &lt;Any&gt;

Events can be fired using the function `fire`.
The first required argument is the name of the event, the second, optional one, is data that can be transmitted.

```javascript
onceupon.fire('name', 'data');
```

#### Multiple arguments
Multiple arguments can also be passed. These are merged into an array.

```javascript
// Listen to the events 'first' and 'second'
onceupon.on('event', data => {
    console.log(data);
    // OUTPUT: ['some', 'data']
});

onceupon.fire('event', 'some', 'data');
```

## License
MIT License

Copyright (c) 2020 Luca Joos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
