# awayback v2.0.2

Custom event system for JavaScript exported as [Node.js](https://nodejs.org) module.

[![npm](https://img.shields.io/npm/v/awayback)](https://www.npmjs.com/package/awayback)
[![npm](https://img.shields.io/github/last-commit/lucajoos/awayback)](https://www.npmjs.com/package/awayback)
[![npm](https://img.shields.io/npm/dm/awayback)](https://www.npmjs.com/package/awayback)

```javascript
let awayback = require('awayback')();

awayback.on('event', (data) => {
    console.log(data);
    // data
});

awayback.fire('event', 'data');
```

## Installation
Install using [NPM](https://npmjs.org) (or yarn):

```
$ npm i -g npm
$ npm i --save awayback
```

In Node.js:

```javascript
// Require awayback & create a new instance
let awayback = require('awayback')();
```

## API
### awayback(object)

- `object` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

Require `awayback` & create a new instance.

```javascript
let awayback = require('awayback')();
```

Assign `awayback` object to an existing one.

```javascript
let data = {};

let awayback = require('awayback')(data);
// Merge awayback & data object
```

### .create(event)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

Optionally, an event with any name can be created.

```javascript
awayback.create('name');
```

### .on(event, callback, options)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `data` &lt;Any&gt;
    - `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `options` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `isIgnoringPrevious` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)


The callback is executed each time the event is fired.
There is a possible argument for the data from the `fire` function. If there are several arguments at the event call, `data` is an array.

```javascript
awayback.on('name', (data) => {
    // Event is fired, callback executed
    // Use transmitted data
    console.log(data);
});
```

If the argument `isExecutingPrevious` in `options` is set to `true`, the listener executes event calls from before the initialization of the listener.

```javascript
// Fire event before the initialization of .on()
// This event call will also be executed
awayback.fire('event', 'before');

setTimeout(() => {
    awayback.on('event', data => {
        console.log(data);
        // OUTPUT: before
        // OUTPUT: after
        // OUTPUT: another call
    }, {
      isExecutingPrevious: true
    });

    awayback.fire('event', 'after');
    awayback.fire('event', 'another call');
}, 1000);
```

#### Multiple events
It is also possible to use a callback for several events. For this purpose, the events names can be separated by a `|`.

```javascript
// Listen to the events 'first' and 'second'
awayback.on('first|second', () => {
    // Event 'first' or 'second' is fired, callback executed
});
```

### .once(event, callback, ignorePreviousCalls)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `data` &lt;Any&gt;
    - `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `options` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `isIgnoringPrevious` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

The callback is only executed once when the event is called first.
There is a possible argument for the data from the `fire` function. If there are several arguments at the event call, `data` is an array.

```javascript
awayback.once('event', (data) => {
    // Event is fired, callback executed
    // Use transmitted data
    console.log(data);
    // one
});

awayback.fire('event', 'one');
awayback.fire('event', 'two');
```

If the argument `isExecutingPrevious` in `options` is set to `true`, the listener executes event calls from before the initialization of the listener.

```javascript
// Fire event before the initialization of .once()
// This event call will also be executed
awayback.fire('event', 'before');

setTimeout(() => {
  awayback.once('event', data => {
    console.log(data);
    // OUTPUT: before
  }, {
    isExecutingPrevious: true
  });
}, 1000);
```

#### Multiple events
It is also possible to use a callback for several events. For this purpose, the events names can be separated by a `|`.

```javascript
// Listen to the events 'first' and 'second'
awayback.once('first|second', () => {
    // Event 'first' or 'second' is fired, callback executed
});
```

### .only(event, callback, ignorePreviousCalls)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `data` &lt;Any&gt;
    - `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `options` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `isIgnoringPrevious` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

The callback is only executed if this callback is the first and only one to be called.
There is a possible argument for the data from the `fire` function. If there are several arguments at the event call, `data` is an array.

```javascript
awayback.only('name', (data) => {
    // Event is fired, callback executed
    // Use transmitted data
    console.log(data);
});
```

```javascript
awayback.on('event', () => {});

awayback.only('event', (data) => {
    // Event is fired, callback is not executed
    // because it's not the only event listener
    console.log(data);
});

awayback.fire('event', 'data');
```

If the argument `isExecutingPrevious` in `options` is set to `true`, the listener executes event calls from before the initialization of the listener.

```javascript
// Fire event before the initialization of .only()
// This event call will also be executed
awayback.fire('event', 'before');

setTimeout(() => {
  awayback.only('event', data => {
    console.log(data);
    // OUTPUT: before
  }, {
    isExecutingPrevious: true
  });
}, 1000);
```

#### Multiple events
It is also possible to use a callback for several events. For this purpose, the events names can be separated by a `|`.

```javascript
// Listen to the events 'first' and 'second'
awayback.only('first|second', () => {
    // Event 'first' or 'second' is fired, callback executed
});
```

### .fire(event, ...data)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `data` &lt;Any&gt;

Events can be fired using the function `fire`.
The first required argument is the name of the event, the second, optional one, is data that can be transmitted.

```javascript
awayback.fire('name', 'data');
```

#### Multiple events
It is also possible to fire multiple events with one call. For this purpose, the events names can be separated by a `|`.

```javascript
// Fire the events 'first' and 'second' with the same call
awayback.fire('first|second', 'data');
```

#### Multiple arguments
If there are more than two arguments, `data` is an array.

```javascript
// Listen to the events 'first' and 'second'
awayback.on('event', data => {
    console.log(data);
    // OUTPUT: ['some', 'data']
});

awayback.fire('event', 'some', 'data');
```

### .isFired(event)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

Returns: [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

Returns if a given `event` was fired.

```javascript
// Fire an event
awayback.fire('event');

// Check if event was fired
awayback.isFired('event')
// true
```

## License
MIT License

Copyright (c) 2022 Luca Joos

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
