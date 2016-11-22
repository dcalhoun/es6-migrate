jest.mock('amd-to-es6')
jest.mock('eslint')
jest.mock('espresso-transformer')
jest.mock('fs')
jest.mock('path')
jest.mock('standard')

import fs from 'fs'

import ES6Migrate from '../es6-migrate'

let es6Migrate, files

describe('ES6Migrate', () => {
  it('exports a Function', () => {
    expect(ES6Migrate).toBeInstanceOf(Function)
  })
})

describe('ES6Migrate.clean', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()
  })

  afterEach(() => {
    fs.unlinkSync.mockClear()
  })

  describe('when passed files', () => {
    beforeEach(() => {
      files = ['path/to/foo.coffee', 'path/to/bar.coffee']
    })

    it('returns a Promise', () => (
      es6Migrate.clean(files).then((files) => {
        expect(files).toBeInstanceOf(Array)
      })
    ))

    it('calls fs.unlinkSync', () => (
      es6Migrate.clean(files).then((files) => {
        expect(fs.unlinkSync).toHaveBeenCalledTimes(2)
      })
    ))
  })

  describe('when passed no files', () => {
    beforeEach(() => {
      files = undefined
    })

    it('returns a TyperError', () => (
      es6Migrate.clean(files).catch((err) => {
        expect(err).toBeInstanceOf(TypeError)
      })
    ))

    it('does not call fs.unlinkSync', () => (
      es6Migrate.clean(files).catch(() => {
        expect(fs.unlinkSync).not.toHaveBeenCalled()
      })
    ))
  })
})
