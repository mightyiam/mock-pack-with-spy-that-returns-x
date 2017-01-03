const mock = require('mock-require')
const { spy: spyOn } = require('simple-spy')
const {
  sep,
  resolve,
  relative
} = require('path')

const generator = function* (path, arity, spyReturn) {
  while (true) {
    const spy = spyOn(() => spyReturn)
    Object.defineProperty(spy, 'length', { value: arity })
    mock(path, spy) // impure
    yield spy
  }
}

const mockPathWithSimpleSpy = (path, spyReturn) => {
  let relativePath
  if (path.startsWith('.')) {
    const parentModuleDirname = resolve(module.parent.filename, '..')
    const absolutePath = resolve(parentModuleDirname, path)
    relativePath = '.' + sep + relative(__dirname, absolutePath)
  } else {
    relativePath = path
  }

  const arity = require(relativePath).length

  spyReturn = spyReturn || Symbol(path)

  const mocks = generator(relativePath, arity, spyReturn)
  mocks.spyReturn = spyReturn
  mocks.stop = () => mock.stop(relativePath)
  return mocks
}

module.exports = mockPathWithSimpleSpy
