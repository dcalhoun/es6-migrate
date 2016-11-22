jest.mock('amd-to-es6')
jest.mock('eslint')
jest.mock('espresso-transformer')
jest.mock('fs')
jest.mock('standard')

import espresso from 'espresso-transformer'
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

    it('returns a Array', () => (
      es6Migrate.clean(files).then((resp) => {
        expect(resp).toBeInstanceOf(Array)
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

describe('ES6Migrate.convertCoffeeScript', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()
  })

  afterEach(() => {
    espresso.mockClear()
    fs.readFileSync.mockClear()
    fs.writeFileSync.mockClear()
  })

  describe('when passed files', () => {
    beforeEach(() => {
      files = [
        'path/to/foo.coffee',
        'path/to/bar.coffee',
        'path/to/baz.coffee'
      ]
    })

    it('returns an Array', () => (
      es6Migrate.convertCoffeeScript(files).then((resp) => (
        expect(resp).toBeInstanceOf(Array)
      ))
    ))

    it('returns an Array of mapped files', () => (
      es6Migrate.convertCoffeeScript(files).then((resp) => (
        expect(resp).toEqual([
          'path/to/foo.js',
          'path/to/bar.js',
          'path/to/baz.js'
        ])
      ))
    ))

    it('calls fs.readFileSync', () => (
      es6Migrate.convertCoffeeScript(files).then(() => (
        expect(fs.readFileSync).toHaveBeenCalledTimes(3)
      ))
    ))

    it('calls espresso', () => (
      es6Migrate.convertCoffeeScript(files).then(() => (
        expect(espresso).toHaveBeenCalledTimes(3)
      ))
    ))

    it('calls fs.writeFileSync', () => (
      es6Migrate.convertCoffeeScript(files).then(() => (
        expect(fs.writeFileSync).toHaveBeenCalledTimes(3)
      ))
    ))
  })

  describe('when passed no files', () => {
    beforeEach(() => {
      files = undefined
    })

    it('returns an TypeError', () => (
      es6Migrate.convertCoffeeScript(files).catch((err) => (
        expect(err).toBeInstanceOf(TypeError)
      ))
    ))

    it('does not call fs.readFileSync', () => (
      es6Migrate.convertCoffeeScript(files).catch(() => (
        expect(fs.readFileSync).not.toHaveBeenCalled()
      ))
    ))

    it('does not call fs.writeFileSync', () => (
      es6Migrate.convertCoffeeScript(files).catch(() => (
        expect(fs.writeFileSync).not.toHaveBeenCalled()
      ))
    ))
  })
})
