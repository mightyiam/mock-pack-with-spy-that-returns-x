const mock = require('mock-require')
const { spy: spyOn } = require('simple-spy')
const {
  sep,
  resolve,
  relative
} = require('path')

const mockPathWithSimpleSpy = function* (path, constantReturn) {
  let relativePath
  if (path.startsWith('.')) {
    const parentModuleDirname = resolve(module.parent.filename, '..')
    const absolutePath = resolve(parentModuleDirname, path)
    relativePath = '.' + sep + relative(__dirname, absolutePath)
  } else {
    relativePath = path
  }

  const arity = require(relativePath).length

  const stop = () => mock.stop(relativePath)

  while (true) {
    const spyReturn = constantReturn || Symbol(path)
    const spy = spyOn(() => spyReturn)
    Object.defineProperty(spy, 'length', { value: arity })

    mock(relativePath, spy) // impure

    yield { spyReturn, spy, stop }
  }
}

module.exports = mockPathWithSimpleSpy
