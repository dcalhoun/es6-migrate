jest.mock('amd-to-es6')
jest.mock('eslint')
jest.mock('espresso-transformer')
jest.mock('fs')
jest.mock('standard')

import amd2Es6 from 'amd-to-es6'
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

  describe('when passed no files', () => {
    it('returns a TyperError', () => (
      es6Migrate.clean().catch((err) => {
        expect(err).toBeInstanceOf(TypeError)
      })
    ))

    it('does not call fs.unlinkSync', () => (
      es6Migrate.clean().catch(() => {
        expect(fs.unlinkSync).not.toHaveBeenCalled()
      })
    ))
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

  describe('when passed no files', () => {
    it('returns an TypeError', () => (
      es6Migrate.convertCoffeeScript().catch((err) => (
        expect(err).toBeInstanceOf(TypeError)
      ))
    ))

    it('does not call fs.readFileSync', () => (
      es6Migrate.convertCoffeeScript().catch(() => (
        expect(fs.readFileSync).not.toHaveBeenCalled()
      ))
    ))

    it('does not call fs.writeFileSync', () => (
      es6Migrate.convertCoffeeScript().catch(() => (
        expect(fs.writeFileSync).not.toHaveBeenCalled()
      ))
    ))
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
})

describe('ES6Migrate.convertMigrate', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()
  })

  afterEach(() => {
    amd2Es6.mockClear()
    fs.readFileSync.mockClear()
    fs.writeFileSync.mockClear()
  })

  describe('when passed no files', () => {
    it('returns a TypeError', () => {
      es6Migrate.convertModules().catch((err) => (
        expect(err).toBeInstanceOf(TypeError)
      ))
    })

    it('does not call amd2Es6', () => {
      es6Migrate.convertModules().catch(() => (
        expect(amd2Es6).not.toHaveBeenCalled()
      ))
    })
  })

  describe('when passed files', () => {
    beforeEach(() => {
      files = ['path/to/foo.coffee']
    })

    it('returns an Array of converted files', () => {
      es6Migrate.convertModules(files).then(() => (
        expect(files).toEqual([
          'path/to/foo.coffee'
        ])
      ))
    })

    it('calls fs.writeFileSync', () => (
      es6Migrate.convertCoffeeScript(files).then(() => (
        expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
      ))
    ))

    it.skip('calls amd2Es6', () => (
      es6Migrate.convertCoffeeScript(files).then(() => (
        expect(amd2Es6).toHaveBeenCalledTimes(1)
      ))
    ))
  })
})

describe('ES6Migrate.handleError', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()
  })
})

describe('ES6Migrate.handleSuccess', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()
  })
})

describe('ES6Migrate.lint', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()
  })
})

describe('ES6Migrate.migrate', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()
  })
})
