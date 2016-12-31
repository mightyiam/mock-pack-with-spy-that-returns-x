[![Build Status](https://travis-ci.org/mightyiam/mock-path-with-simple-spy.svg?branch=master)](https://travis-ci.org/mightyiam/mock-path-with-simple-spy)
[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

# mock-path-with-simple-spy

[Mocks](https://www.npmjs.com/package/mock-require)
a given path with a
[simple spy](https://www.npmjs.com/package/simple-spy)
that returns either a symbol or something provided by you.

## Why?

Because in unit tests, we mock some dependency functions.  
And, usually, we like them to return a constant value.  
And, usually, we like to assert their calls/args.  
And, usually, we `require` the test subject multiple times.

This utility fits that pattern.

## How?

### Example

#### `dep.js`
```js
// we will be mocking this file

module.exports = (x) => x.toUpperCase()
```

#### `index.js`
```js
// this module will be our test subject

const dep = require('./dep')
module.exports = (x) => dep(x) + '-foo'
```

#### `index.test.js`
```js
// unit tests here

const assert = require('assert')
const mockPathWithSimpleSpy = require('mock-path-with-simple-spy')
const requireUncached = require('require-uncached')

// set up a mock
const depMocks = mockPathWithSimpleSpy(
  './dep', // path to mock
  'MOCKED' // mocked function return value
)

// test A
const depMockA = depMocks.next().value // mock
const subjectA = requireUncached('.')
const actualA = subjectA('a')
assert.strictEqual(actualA, 'MOCKED-foo') // `./dep` is mocked
assert.deepStrictEqual(depMockA.spy.args, [['a']]) // spy available

// test B
const depMockB = depMocks.next().value
const subjectB = requireUncached('.')
const actualB = subject('b')
assert.strictEqual((actualB, 'MOCKED-foo')
assert.deepStrictEqual(depMockB.spy.args, [['b']])
```

### API

#### `mockPathWithSimpleSpy(path[, constantReturn])` (generator)

- `path`  
  The path to mock.
  Will be passed to
  [`mock`](https://www.npmjs.com/package/mock-require#mockpath-mockexport).
- `constantReturn` (optional)  
  If provided, the spy will return provided value.  
  If not provided, the spy will return a symbol
  that is unique to each mock.  
  The description of the symbols will be `path`.  

Returns an iterator:  
On `next`, the `path` is mocked with a new spy
and an object is returned:
- `spy`  
  The [simple-spy](https://www.npmjs.com/package/simple-spy)
  spy
- `spyReturn`  
  The spy’s return value
- `stop()`  
  Calls [`mock.stop`](https://github.com/boblauer/mock-require#mockstoppath)
  on the `path`

### Caveats

#### Uses `module.parent`

So it must always be `require`d
directly in the module where it is used.
This may be fixed by using
[caller-path](https://www.npmjs.com/package/caller-path)
instead of `module.parent`,
so please report an issue
if you find that it bothers you.

#### `require`s the mocked module

The `path` is `require`d
and the exported function’s length is examined,
for the purpose of the mock function
being of the same arity as the mocked function.
