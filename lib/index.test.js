const { test } = require('ava')
const isPlainObj = require('is-plain-obj')
const mock = require('mock-require')
const symbolDescription = require('symbol-description')
const decache = require('decache')

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

test('exported function returns an object', (t) => {
  const returnValue = t.context.subject(...defaultArgs)
  t.true(isPlainObj(returnValue))
  mock.stop(fixturePath)
})

test('if `spyReturn` not provided, `spyReturn` prop is a symbol', (t) => {
  const { spyReturn } = t.context.subject(...defaultArgs)
  t.is(typeof spyReturn, 'symbol')
  mock.stop(fixturePath)
})

test('mocks relative path resolved from `callerPath` and `path`', (t) => {
  const fixture = require(fixturePath)
  t.context.subject(...defaultArgs)
  const spy = require(fixturePath)
  t.not(fixture, spy)
  mock.stop(fixturePath)
})

test('`spy` prop is the mock', t => {
  const { spy } = t.context.subject(...defaultArgs)
  t.is(require(fixturePath), spy)
  mock.stop(fixturePath)
})

test('`spy` is a function', (t) => {
  const spy = t.context.subject(...defaultArgs).spy
  t.is(typeof spy, 'function')
  mock.stop(fixturePath)
})

test('spy function has arity of mocked function', (t) => {
  const expected = require(fixturePath).length
  const actual = t.context.subject(...defaultArgs).spy.length
  t.is(actual, expected)
  mock.stop(fixturePath)
})

test('if `spyReturn` provided, spy returns it', (t) => {
  const args = defaultArgs.concat(Symbol())
  const spy = t.context.subject(...args).spy
  const actual = spy()
  t.is(actual, args[1])
  mock.stop(fixturePath)
})

test('if `spyReturn` not provided, spy returns a symbol', (t) => {
  const { spy } = t.context.subject(...defaultArgs)
  t.is(typeof spy(), 'symbol')
  mock.stop(fixturePath)
})

test('symbol’s description is `path`', (t) => {
  const { spy } = t.context.subject(...defaultArgs)
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
  const spyReturn = subject(...defaultArgs).spy()
  t.is(spyReturn, simpleSpyMock.returnValue)
  mock.stop('simple-spy')
  mock.stop(fixturePath)
})

test('if `spyReturn` provided, spy return value is `spyReturn` prop', t => {
  const args = defaultArgs.concat(Symbol())
  const { spy, spyReturn } = t.context.subject(...args)
  t.is(spy(), spyReturn)
  mock.stop(fixturePath)
})

test('if `spyReturn` not provided, spy return value is `spyReturn` prop', t => {
  const { spy, spyReturn } = t.context.subject(...defaultArgs)
  t.is(spy(), spyReturn)
  mock.stop(fixturePath)
})

test('`stop` prop call stops mocking`', (t) => {
  const { stop } = t.context.subject(...defaultArgs)
  stop()
  const fixture = require(fixturePath)
  t.is(fixture(), fixture.returnValue)
})

test('can mock a `node_modules` path', (t) => {
  const returnVal = Symbol('returnVal')
  const path = 'no-op'
  t.context.subject(path, returnVal)
  t.is(require(path)(), returnVal)
})
