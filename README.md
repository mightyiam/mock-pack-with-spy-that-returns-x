[![Build Status](https://travis-ci.org/mightyiam/mock-path-with-spy-that-returns-x.svg?branch=master)](https://travis-ci.org/mightyiam/mock-path-with-spy-that-returns-x)
[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

# mock-path-with-spy-that-returns-x

[Mocks](https://www.npmjs.com/package/mock-require)
a given path with a
[spy](https://www.npmjs.com/package/simple-spy)
that returns either a symbol or something provided by you.

## Why?

Because in unit tests, we mock some dependency functions.  
And, usually, we like them to return a constant value.  
And, usually, we like to assert their calls/args.

This utility fits that pattern.

## How?

### Example

```js
// dep.js
module.exports = (x) => x + 'foo'
```

```js
// index.js
const dep = require('./dep')
module.exports = () => [dep('fee'), 'bar']
```

```js
// index.test.js
const assert = require('assert')
const mockPathWithSpy = require('mock-path-with-spy-that-returns-x')

const depMock = mockPathWithSpy('./dep', 'zanzi')
const subject = require('.')

const actual = subject()
assert.deepStrictEqual(actual, ['zanzi', 'bar'])

depMock.returnValue // 'zanzi'
depMock.spy.args // [['fee']]
```

### API

#### `mockPathWithSpy(path[, spyReturn])`

- `path`:
  The path to mock.
  Will be passed to
  [`mock`](https://www.npmjs.com/package/mock-require#mockpath-mockexport).
- `spyReturn`:
  Optional.
  If not provided, the spy will return a symbol.
  The description of the symbol will be the `path`.
  If provided, the spy will return this value.

Returns an object:
- `spy`:
  The [simple-spy](https://www.npmjs.com/package/simple-spy)
  spy
- `returnValue`:
  The constant value that the spy will always return
- `stop()`:
  Calls [`mock.stop`](https://github.com/boblauer/mock-require#mockstoppath)
  on the `path`

### Caveats

Uses `module.parent` internally.
So it must always be `require`d
directly in the module where it is used.
This may be fixed by using
[caller-path](https://www.npmjs.com/package/caller-path)
instead of `module.parent`,
so please report an issue
if you find that it bothers you.
