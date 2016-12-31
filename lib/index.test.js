const { test } = require('ava')
const isPlainObj = require('is-plain-obj')
const mock = require('mock-require')
const symbolDescription = require('symbol-description')
const decache = require('decache')
const isGeneratorFn = require('is-generator-fn')

const subjectPath = '.'

const fixturePath = '../test/_fixture'
const defaultArgs = [fixturePath]

test.beforeEach((t) => {
  decache(subjectPath)
  t.context.subject = require(subjectPath)
})

test('exports a generator function of arity 2', (t) => {
  t.true(isGeneratorFn(t.context.subject))
  t.is(t.context.subject.length, 2)
})

test('yields an object', (t) => {
  const value = t.context.subject(...defaultArgs).next().value
  t.true(isPlainObj(value))
  mock.stop(fixturePath)
})

test('if `constantReturn` not provided, `spyReturn` prop is a symbol', (t) => {
  const { spyReturn } = t.context.subject(...defaultArgs).next().value
  t.is(typeof spyReturn, 'symbol')
  mock.stop(fixturePath)
})

test('mocks relative path resolved from `callerPath` and `path`', (t) => {
  const fixture = require(fixturePath)
  t.context.subject(...defaultArgs).next()
  const spy = require(fixturePath)
  t.not(fixture, spy)
  mock.stop(fixturePath)
})

test('`spy` prop is the mock', t => {
  const { spy } = t.context.subject(...defaultArgs).next().value
  t.is(require(fixturePath), spy)
  mock.stop(fixturePath)
})

test('`spy` is a function', (t) => {
  const { spy } = t.context.subject(...defaultArgs).next().value
  t.is(typeof spy, 'function')
  mock.stop(fixturePath)
})

test('spy function has arity of mocked function', (t) => {
  const expected = require(fixturePath).length
  const actual = t.context.subject(...defaultArgs).next().value.spy.length
  t.is(actual, expected)
  mock.stop(fixturePath)
})

test('if `constantReturn` provided, spy returns it', (t) => {
  const args = defaultArgs.concat(Symbol())
  const { spy } = t.context.subject(...args).next().value
  const actual = spy()
  t.is(actual, args[1])
  mock.stop(fixturePath)
})

test('if `constantReturn` not provided, spy returns a symbol', (t) => {
  const { spy } = t.context.subject(...defaultArgs).next().value
  t.is(typeof spy(), 'symbol')
  mock.stop(fixturePath)
})

test('symbol’s description is `path`', (t) => {
  const { spy } = t.context.subject(...defaultArgs).next().value
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
  const spyReturn = subject(...defaultArgs).next().value.spy()
  t.is(spyReturn, simpleSpyMock.returnValue)
  mock.stop('simple-spy')
  mock.stop(fixturePath)
})

test('if `constantReturn` provided, spy return value is `spyReturn` prop', t => {
  const args = defaultArgs.concat(Symbol())
  const { spy, spyReturn } = t.context.subject(...args).next().value
  t.is(spy(), spyReturn)
  mock.stop(fixturePath)
})

test('if `constantReturn` not provided, spy return value is `spyReturn` prop', t => {
  const { spy, spyReturn } = t.context.subject(...defaultArgs).next().value
  t.is(spy(), spyReturn)
  mock.stop(fixturePath)
})

test('`stop` prop call stops mocking`', (t) => {
  const { stop } = t.context.subject(...defaultArgs).next().value
  stop()
  const fixture = require(fixturePath)
  t.is(fixture(), fixture.returnValue)
})

test('can mock a `node_modules` path', (t) => {
  const returnVal = Symbol('returnVal')
  const path = 'no-op'
  t.context.subject(path, returnVal).next().value
  t.is(require(path)(), returnVal)
  mock.stop(path)
})

test('each iteration returns a different `spy`', (t) => {
  const iterator = t.context.subject(...defaultArgs)
  const spyA = iterator.next().value.spy
  const spyB = iterator.next().value.spy
  t.not(spyA, spyB)
  mock.stop(fixturePath)
})

test('each iteration returns a different `spyReturn`', (t) => {
  const iterator = t.context.subject(...defaultArgs)
  const spyReturnA = iterator.next().value.spyReturn
  const spyReturnB = iterator.next().value.spyReturn
  t.not(spyReturnA, spyReturnB)
  mock.stop(fixturePath)
})

test('different iterations return the same `spyReturn` if `constantReturn` provided', (t) => {
  const iterator = t.context.subject(fixturePath, Symbol('constantReturn'))
  const spyReturnA = iterator.next().value.spyReturn
  const spyReturnB = iterator.next().value.spyReturn
  t.is(spyReturnA, spyReturnB)
  mock.stop(fixturePath)
})

test('different iterations return the same `stop`', (t) => {
  const iterator = t.context.subject(...defaultArgs)
  const stopA = iterator.next().value.stop
  const stopB = iterator.next().value.stop
  t.is(stopA, stopB)
  mock.stop(fixturePath)
})
