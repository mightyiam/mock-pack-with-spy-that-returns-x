const mock = require('mock-require')
const { spy: spyOn } = require('simple-spy')
const {
  sep,
  resolve,
  relative
} = require('path')

const mockPathWithSpy = (path, spyReturn) => {
  spyReturn = spyReturn || Symbol(path)

  const parentModuleDirname = resolve(module.parent.filename, '..')
  const absolutePath = resolve(parentModuleDirname, path)
  const relativePath = '.' + sep + relative(__dirname, absolutePath)

  const arity = require(relativePath).length
  const spy = spyOn(() => spyReturn)
  Object.defineProperty(spy, 'length', { value: arity })

  mock(relativePath, spy) // impure
  const stop = () => mock.stop(relativePath)

  return { spyReturn, spy, stop }
}

module.exports = mockPathWithSpy
