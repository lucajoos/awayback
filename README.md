# onceupon.js v1.0.4
Custom event system for JavaScript exported as [Node.js](https://nodejs.org) module.

```javascript
const ou = require('onceupon.js')();

ou.on('hello', (data) => {
    console.log(data);
    // world
});

ou.fire('hello', 'world');
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
const onceupon = require('onceupon.js')();
```

## API
### .create(event)
Optionally, an event with any name can now be created.

```javascript
onceupon.create('name');
```

### .on(event, callback)

- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `data` &lt;Unkown&gt;
    - `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

There are to possibilities to listen to created events.

The first one is by using the function `on`. The callback is executed with each time the event is fired.

There is a possible argument for the transfer of data that the function .fire can give.

```javascript
onceupon.on('name', (data) => {
    // Event is fired, callback executed
    // Use transmitted data
    console.log(data);
});
```

### .once(event, callback)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
    - `data` &lt;Unkown&gt;
    - `event` [&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

The second one is by using the function `once`. The callback is executed only once at the first firing of the event.

```javascript
onceupon.once('name', (data) => {
    // Event is fired, callback executed
    // Use transmitted data
    console.log(data);
});
```

### .fire(event, data)
Events can be fired using the function `fire`.
The first required argument is the name of the event, the second, optional one, is data that can be transmitted.

```javascript
onceupon.fire('name', 'data');
```

### Multiple events
It is also possible to use a callback for several events. For this purpose, the events names can be separated by a `|`.

```javascript
// Listen to the events 'first' and 'second'
onceupon.on('first|second', () => {
    // Event 'first' or 'second' is fired, callback executed
});
```

## License
MIT License

Copyright (c) 2019 Luca Joos

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
