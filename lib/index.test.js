const { test } = require('ava')
const mock = require('mock-require')
const symbolDescription = require('symbol-description')
const decache = require('decache')
const isIteratorLike = require('is-iterator-like')
const isGeneratorFn = require('is-generator-fn')

const subjectPath = '.'

const fixturePath = '../test/_fixture'
const defaultArgs = [fixturePath]

test.beforeEach((t) => {
  decache(subjectPath)
  t.context.subject = require(subjectPath)
})

test('exports a function of arity 2', (t) => {
  t.is(typeof t.context.subject, 'function')
  t.is(t.context.subject.length, 2)
})

test('does not export a generator function', (t) => {
  t.false(isGeneratorFn(t.context.subject))
})

test('returns an iterator', (t) => {
  const spyReturn = t.context.subject(...defaultArgs)
  t.true(isIteratorLike(spyReturn))
})

test('if `spyReturn` not provided, `spyReturn` prop is a symbol', (t) => {
  const iterator = t.context.subject(...defaultArgs)
  t.is(typeof iterator.spyReturn, 'symbol')
})

test('mocks relative path resolved from `callerPath` and `path`', (t) => {
  const fixture = require(fixturePath)
  t.context.subject(...defaultArgs).next()
  const spy = require(fixturePath)
  t.not(fixture, spy)
  mock.stop(fixturePath)
})

test('yielded value is the mock', t => {
  const spy = t.context.subject(...defaultArgs).next().value
  t.is(require(fixturePath), spy)
  mock.stop(fixturePath)
})

test('`spy` is a function', (t) => {
  const spy = t.context.subject(...defaultArgs).next().value
  t.is(typeof spy, 'function')
  mock.stop(fixturePath)
})

test('spy function has arity of mocked function', (t) => {
  const expected = require(fixturePath).length
  const actual = t.context.subject(...defaultArgs).next().value.length
  t.is(actual, expected)
  mock.stop(fixturePath)
})

test('if `spyReturn` provided, spy returns it', (t) => {
  const args = defaultArgs.concat(Symbol())
  const spy = t.context.subject(...args).next().value
  const actual = spy()
  t.is(actual, args[1])
  mock.stop(fixturePath)
})

test('if `spyReturn` not provided, spy returns a symbol', (t) => {
  const spy = t.context.subject(...defaultArgs).next().value
  t.is(typeof spy(), 'symbol')
  mock.stop(fixturePath)
})

test('symbol’s description is `path`', (t) => {
  const spy = t.context.subject(...defaultArgs).next().value
  const actual = symbolDescription(spy())
  t.is(actual, defaultArgs[0])
  mock.stop(fixturePath)
})

test('`spy` is a `simple-spy` spy', (t) => {
  const simpleSpyMock = {}
  simpleSpyMock.returnValue = Symbol('simpleSpyMock.returnValue')
  simpleSpyMock.stub = { spy: (fn) => () => simpleSpyMock.returnValue }
  mock('simple-spy', simpleSpyMock.stub)
  decache(subjectPath)
  const subject = require(subjectPath)
  const spyReturn = subject(...defaultArgs).next().value()
  t.is(spyReturn, simpleSpyMock.returnValue)
  mock.stop('simple-spy')
  mock.stop(fixturePath)
})

test('if `spyReturn` provided, spy return value is `spyReturn` prop', t => {
  const args = defaultArgs.concat(Symbol())
  const iterator = t.context.subject(...args)
  const spy = iterator.next().value
  t.is(spy(), iterator.spyReturn)
  mock.stop(fixturePath)
})

test('if `spyReturn` not provided, spy return value is `spyReturn` prop', t => {
  const iterator = t.context.subject(...defaultArgs)
  const spy = iterator.next().value
  t.is(spy(), iterator.spyReturn)
  mock.stop(fixturePath)
})

test('`stop` prop call stops mocking`', (t) => {
  const iterator = t.context.subject(...defaultArgs)
  iterator.next().value
  iterator.stop()
  const fixture = require(fixturePath)
  t.is(fixture(), fixture.returnValue)
})

test('can mock a `node_modules` path', (t) => {
  const spyReturn = Symbol('spyReturn')
  const path = 'no-op'
  t.context.subject(path, spyReturn).next()
  t.is(require(path)(), spyReturn)
  mock.stop(path)
})

test('each iteration returns a different `spy`', (t) => {
  const iterator = t.context.subject(...defaultArgs)
  const spyA = iterator.next().value
  const spyB = iterator.next().value
  t.not(spyA, spyB)
  mock.stop(fixturePath)
})
