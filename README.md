# awayback v3.4.1

A custom event system.

[![npm](https://img.shields.io/npm/v/awayback)](https://www.npmjs.com/package/awayback)
[![npm](https://img.shields.io/github/last-commit/lucajoos/awayback)](https://www.npmjs.com/package/awayback)
[![npm](https://img.shields.io/npm/dm/awayback)](https://www.npmjs.com/package/awayback)

```javascript
import awayback from 'awayback'
const events = awayback()

events.on('event', (data) => {
  console.log(data)
  // data
})

events.emit('event', 'data')
```

## Installation

Install using [NPM](https://npmjs.org) (or yarn):

```
$ npm i -g npm
$ npm i --save awayback
```

In JavaScript:

```javascript
// Require awayback & create a new instance
import awayback from 'awayback'
const events = awayback()
```

## API

### awayback()

Require `awayback` & create a new instance.

```javascript
import awayback from 'awayback'
const events = awayback()
```

### .on(event, callback, options)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - `...data` &lt;Any&gt;
- `options` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `signal` [&lt;AbortSignal;](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
  - `isExecutingPrevious` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

The callback is executed each time the event is fired.
The arguments from the `emit` function call are also exposed to the listener.

```javascript
events.on('name', (data) => {
  // Event is fired, callback executed
  // Use transmitted data
  console.log(data)
})
```

If the `signal` option is provided, the listener can be aborted using an `AbortController`.

```javascript
const controller = new AbortController()
const { signal } = controller

events.on(
  'event',
  (data) => {
    console.log(data)
    // OUTPUT: data
  },
  { signal }
)

events.emit('event', 'data')

// Abort the listener
controller.abort()

events.emit('event', 'more data')
// No output, listener has been aborted
```

The `signal` option allows for fine-grained control over event listeners, enabling you to cancel them when they are no longer needed.

If the argument `isExecutingPrevious` in `options` is set to `true`, the listener executes event calls from before the initialization of the listener.

```javascript
// Fire event before the initialization of .on()
// This event call will also be executed
events.emit('event', 'before')

setTimeout(() => {
  events.on(
    'event',
    (data) => {
      console.log(data)
      // OUTPUT: before
      // OUTPUT: after
      // OUTPUT: another call
    },
    {
      isExecutingPrevious: true,
    }
  )

  evens.emit('event', 'after')
  events.emit('event', 'another call')
}, 1000)
```

### .once(event, callback, options)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - `...data` &lt;Any&gt;
  - `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `options` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `isExecutingPrevious` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

The callback is only executed once when the event is called first.
The arguments from the `emit` function call are also exposed to the listener.

```javascript
events.once('event', (data) => {
  // Event is fired, callback executed
  // Use transmitted data
  console.log(data)
  // OUTPUT: one
})

events.emit('event', 'one')
events.emit('event', 'two')
```

If the `signal` option is provided, the listener can be aborted using an `AbortController`.

```javascript
const controller = new AbortController()
const { signal } = controller

events.on(
  'event',
  (data) => {
    console.log(data)
    // OUTPUT: data
  },
  { signal }
)

events.emit('event', 'data')

// Abort the listener
controller.abort()

events.emit('event', 'more data')
// No output, listener has been aborted
```

The `signal` option allows for fine-grained control over event listeners, enabling you to cancel them when they are no longer needed.

If the argument `isExecutingPrevious` in `options` is set to `true`, the listener executes event calls from before the initialization of the listener.

```javascript
// Fire event before the initialization of .once()
// This event call will also be executed
events.emit('event', 'before')

setTimeout(() => {
  events.once(
    'event',
    (data) => {
      console.log(data)
      // OUTPUT: before
    },
    {
      isExecutingPrevious: true,
    }
  )
}, 1000)
```

### .only(event, callback, options)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - `...data` &lt;Any&gt;
  - `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `options` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `isExecutingPrevious` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

The callback is only executed if this callback is the first and only one to be called.
The arguments from the `emit` function call are also exposed to the listener.

```javascript
events.only('name', (data) => {
  // Event is fired, callback executed
  // Use transmitted data
  console.log(data)
})
```

```javascript
events.on('event', () => {})

events.only('event', (data) => {
  // Event is fired, callback is not executed
  // because it's not the only event listener
  console.log(data)
})

events.emit('event', 'data')
```

If the `signal` option is provided, the listener can be aborted using an `AbortController`.

```javascript
const controller = new AbortController()
const { signal } = controller

events.on(
  'event',
  (data) => {
    console.log(data)
    // OUTPUT: data
  },
  { signal }
)

events.emit('event', 'data')

// Abort the listener
controller.abort()

events.emit('event', 'more data')
// No output, listener has been aborted
```

The `signal` option allows for fine-grained control over event listeners, enabling you to cancel them when they are no longer needed.

If the argument `isExecutingPrevious` in `options` is set to `true`, the listener executes event calls from before the initialization of the listener.

```javascript
// Fire event before the initialization of .only()
// This event call will also be executed
events.emit('event', 'before')

setTimeout(() => {
  events.only(
    'event',
    (data) => {
      console.log(data)
      // OUTPUT: before
    },
    {
      isExecutingPrevious: true,
    }
  )
}, 1000)
```

### .emit(event, ...data)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `...data` &lt;Any&gt;

Events can be fired using the function `fire`.
The first required argument is the name of the event, the second, optional one, is data that can be transmitted.

```javascript
events.emit('name', 'data')
```

#### Multiple arguments

More than two arguments can be passed on.

```javascript
// Listen to the events 'first' and 'second'
events.on('event', (...data) => {
  console.log(data)
  // OUTPUT: ['some', 'data']
})

events.emit('event', 'some', 'data')
```

### .remove(event, callback)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - `...data` &lt;Any&gt;
  - `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

Removes a listener from the event so that this is no longer executed when firing.

```javascript
const handler = () => {}

events.on('event', handler)
events.remove('event', handler)
```

### .destroy()

Iterates through all registered event listeners and removes them, effectively
disabling any further event handling for the object.

```javascript
events.destroy()
```

## License

MIT License

Copyright (c) 2025 Luca Joos

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
