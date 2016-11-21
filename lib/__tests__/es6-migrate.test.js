import es6Migrate from '../es6-migrate'

it('exports a function', function () {
  expect(es6Migrate).toBeInstanceOf(Function)
})
