# awayback v5.0.0

A custom event system with type-safe events.

[![npm](https://img.shields.io/npm/v/awayback)](https://www.npmjs.com/package/awayback)
[![npm](https://img.shields.io/github/last-commit/lucajoos/awayback)](https://www.npmjs.com/package/awayback)
[![npm](https://img.shields.io/npm/dm/awayback)](https://www.npmjs.com/package/awayback)

```javascript
import awayback from 'awayback'
const events = awayback()

events.on('event', (data) => {
  console.log(data) // OUTPUT: data
})

events.emit('event', 'data')
```

## Installation

```
$ npm i awayback
```

Afterwards:

```javascript
// Import and create a new 'awayback' event system instance.
import awayback from 'awayback'
const events = awayback()
```

## API

### awayback(replay?)

Create a new `awayback` event system instance.

- `replay` [&lt;Array&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) Optional array of event names to enable replay functionality for specific events. When `undefined` (default), no events support replay.
- **returns:** `Awayback<D, R>` where `D` is your event definitions and `R` is the replay array type

Event replay allows listeners to receive and process previous event emissions when added with the `isReplaying` option set to `true`. By default, no events are replayed. Specify an array of event names to enable replay functionality for only those events.

```typescript
type Events = {
  login: (userId: string) => void
  logout: (userId: string) => void
}

// No events support replay by default
const events = awayback<Events>()

// isReplaying cannot be 'true' without a replay array
events.on(
  'login',
  (userId) => {
    console.log(userId)
  },
  { isReplaying: true }
) // TypeScript error: isReplaying must be false

// To enable replay, specify which events to track
const eventsWithReplay = awayback<Events>(['login'])

// Now isReplaying can be 'true' for 'login' events
eventsWithReplay.on(
  'login',
  (userId) => {
    console.log(userId)
  },
  { isReplaying: true }
)
```

The TypeScript compiler helps prevent accidental usage of replay features on events that aren't configured for replay. This type safety ensures you can't mistakenly attempt to replay events that haven't been stored.

```typescript
type Events = {
  login: () => void
  logout: () => void
}

// Only the 'login' event will support replay
const events = awayback<Events>(['login'])

// isReplaying can be 'true' for 'login' events
events.on('login', () => {}, { isReplaying: true })

// TypeScript error: isReplaying cannot be 'true' for 'logout' since it's not in the replay array
events.on('logout', () => {}, { isReplaying: true })

// Regular event listening works normally, just no replay of previous events
events.on('logout', () => {}, { isReplaying: false })
```

For optimal performance in applications with many events, use the `replay` parameter to restrict replay functionality to only the events that need it. Events not specified in the replay array will not store their historical data, reducing memory usage and improving performance when handling high-frequency events.

### .on(event, callback, options)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - `...data` &lt;Any&gt;
- `options` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `predicate` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `...data` &lt;Any&gt;
    - **returns:** [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  - `signal` [&lt;AbortSignal&gt;](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
  - `isReplaying` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

The callback is executed each time the event is fired.
The arguments from the `emit` function call are also exposed to the listener.

```javascript
events.on('name', (data) => {
  // Event is fired, callback executed
  // Use transmitted data
  console.log(data)
})
```

If the `predicate` option is provided, the callback is only executed if the predicate function returns true.

```javascript
events.on(
  'event',
  (data) => {
    // Event is fired, callback executed
    // Use transmitted data
    console.log(data)
  },
  {
    predicate: (data) => data[0] === 'some',
  }
)

events.emit('event', ['some', 'data'])
// OUTPUT: ['some', 'data']
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

If the argument `isReplaying` in `options` is set to `true`, the listener executes event calls from before the initialization of the listener. Note that this only works for events specified in the replay array when creating the awayback instance.

```javascript
// Create instance with replay enabled for 'event'
const events = awayback(['event'])

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
      isReplaying: true,
    }
  )

  events.emit('event', 'after')
  events.emit('event', 'another call')
}, 1000)
```

### .once(event, callback, options)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - `...data` &lt;Any&gt;
- `options` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `predicate` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `...data` &lt;Any&gt;
    - **returns:** [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  - `signal` [&lt;AbortSignal&gt;](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
  - `isReplaying` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

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

If the `predicate` option is provided, the callback is only executed if the predicate function returns true.

```javascript
events.once(
  'event',
  (data) => {
    // Event is fired, callback executed
    // Use transmitted data
    console.log(data)
  },
  {
    predicate: (data) => data[0] === 'some',
  }
)

events.emit('event', ['some', 'data'])
// OUTPUT: ['some', 'data']
```

If the `signal` option is provided, the listener can be aborted using an `AbortController`.

```javascript
const controller = new AbortController()
const { signal } = controller

events.once(
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

If the argument `isReplaying` in `options` is set to `true`, the listener executes event calls from before the initialization of the listener. Note that this only works for events specified in the replay array when creating the awayback instance.

```javascript
// Create instance with replay enabled for 'event'
const events = awayback(['event'])

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
      isReplaying: true,
    }
  )
}, 1000)
```

### .first(event, callback, options)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - `...data` &lt;Any&gt;
- `options` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `predicate` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `...data` &lt;Any&gt;
    - **returns:** [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  - `signal` [&lt;AbortSignal&gt;](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
  - `isReplaying` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

The callback is only executed if this callback is the first listener registered and no other listener has been executed yet.
The arguments from the `emit` function call are also exposed to the listener.

```javascript
events.first('name', (data) => {
  // Event is fired, callback executed
  // Use transmitted data
  console.log(data)
})
```

```javascript
events.on('event', () => {})

events.first('event', (data) => {
  // Event is fired, callback is not executed
  // because it's not the first event listener
  console.log(data)
})

events.emit('event', 'data')
```

If the `predicate` option is provided, the callback is only executed if the predicate function returns true.

```javascript
events.first(
  'event',
  (data) => {
    // Event is fired, callback executed
    // Use transmitted data
    console.log(data)
  },
  {
    predicate: (data) => data[0] === 'some',
  }
)

events.emit('event', ['some', 'data'])
// OUTPUT: ['some', 'data']
```

If the `signal` option is provided, the listener can be aborted using an `AbortController`.

```javascript
const controller = new AbortController()
const { signal } = controller

events.first(
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

If the argument `isReplaying` in `options` is set to `true`, the listener executes event calls from before the initialization of the listener. Note that this only works for events specified in the replay array when creating the awayback instance.

```javascript
// Create instance with replay enabled for 'event'
const events = awayback(['event'])

// Fire event before the initialization of .first()
// This event call will also be executed
events.emit('event', 'before')

setTimeout(() => {
  events.first(
    'event',
    (data) => {
      console.log(data)
      // OUTPUT: before
    },
    {
      isReplaying: true,
    }
  )
}, 1000)
```

### .emit(event, ...data)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `...data` &lt;Any&gt;

Events can be fired using the function `emit`.
The first required argument is the name of the event, the second, optional one, is data that can be transmitted.

```javascript
events.emit('name', 'data')
```

#### Multiple arguments

More than two arguments can be passed on.

```javascript
// Listen to the event
events.on('event', (...data) => {
  console.log(data)
  // OUTPUT: ['some', 'data']
})

events.emit('event', 'some', 'data')
```

### .promise(event, options): Promise

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `options` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `timeout` [&lt;Number&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  - `reject` [&lt;Array&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
  - `predicate` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `...data` &lt;Any&gt;
    - **returns:** [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  - `signal` [&lt;AbortSignal&gt;](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
  - `isReplaying` [&lt;Boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- **returns:** [&lt;Promise&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Returns a promise that resolves with the value of the current instance.
This function is useful for converting callback-based code to promise-based code.

```javascript
setTimeout(() => {
  // Fire event after 300ms
  events.emit('ready', ['some', 'data'])
}, 300)

const result = await events.promise('ready')

console.log(result)
// OUTPUT: ['some', 'data']
```

If the `predicate` option is provided, the promise will only be resolved if the predicate function returns true.

```javascript
const result = await events
  .promise('ready', {
    predicate: (data) => data[0] === 'some',
  })
  .then((data) => {
    console.log(data)
    // OUTPUT: ['some', 'data']
  })

events.emit('ready', ['some', 'data'])
```

If the `timeout` option is provided, the promise will be rejected after the specified time.

```javascript
const result = await events
  .promise('ready', {
    timeout: 100,
  })
  .catch(() => {
    console.log('timeout')
    // OUTPUT: timeout
  })
```

If the `reject` option is provided, the promise will be rejected as soon as one of the provided events is fired.

```javascript
const result = await events
  .promise('ready', {
    reject: ['error'],
  })
  .catch(() => {
    console.log('error')
    // OUTPUT: error
  })

events.emit('error')
```

### .remove(event, callback)

- `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - `...data` &lt;Any&gt;

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
