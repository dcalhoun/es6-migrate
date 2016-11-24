jest.mock('amd-to-es6')
jest.mock('eslint')
jest.mock('espresso-transformer')
jest.mock('fs')
jest.mock('standard')

import amd2Es6 from 'amd-to-es6'
import espresso from 'espresso-transformer'
import fs from 'fs'
import standard from 'standard'

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
    console.error = jest.fn()
    es6Migrate.handleError('Something bad.')
  })

  afterEach(() => {
    console.error.mockReset()
  })

  it('logs the error', () => {
    expect(console.error).toHaveBeenCalled()
  })
})

describe('ES6Migrate.handleSuccess', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()
    console.log = jest.fn()
    es6Migrate.handleSuccess('Something bad.')
  })

  afterEach(() => {
    console.log.mockReset()
  })

  it('logs a success message', () => {
    expect(console.log).toHaveBeenCalled()
  })
})

describe('ES6Migrate.lint', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()
  })

  afterEach(function () {
    standard.lintFiles.mockClear()
  })

  describe('when passed no files', () => {
    it('returns a TypeError', () => {
      es6Migrate.lint().catch((err) => {
        expect(err).toBeInstanceOf(TypeError)
      })
    })

    it('does not call standard.lintFiles', () => {
      es6Migrate.lint().catch(() => {
        expect(standard.lintFiles).not.toHaveBeenCalled()
      })
    })
  })

  describe('when passed files', () => {
    beforeEach(() => {
      files = [
        'path/to/foo.coffee',
        'path/to/bar.coffe',
        'path/to/baz.coffe'
      ]
    })

    it('returns a an Array of files', () => {
      es6Migrate.lint().then((files) => {
        expect(files).toBeInstanceOf(Array)
      })
    })

    it('does calls standard.lintFiles', () => {
      es6Migrate.lint().then(() => {
        expect(standard.lintFiles).not.toHaveBeenCalledTimes(3)
      })
    })
  })
})

describe('ES6Migrate.migrate', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()

    es6Migrate.convertCoffeeScript = jest.fn(() => Promise.resolve())
    es6Migrate.convertModules = jest.fn(() => Promise.resolve())
    es6Migrate.lint = jest.fn(() => Promise.resolve())
    es6Migrate.clean = jest.fn(() => Promise.resolve())
    es6Migrate.handleSuccess = jest.fn()
  })

  afterEach(() => {
    es6Migrate.convertCoffeeScript.mockReset()
    es6Migrate.convertModules.mockReset()
    es6Migrate.lint.mockReset()
    es6Migrate.clean.mockReset()
    es6Migrate.handleSuccess.mockReset()
  })

  it('converts CoffeeScript to JavaScript', () => (
    es6Migrate.migrate().then(() => {
      expect(es6Migrate.convertCoffeeScript).toHaveBeenCalled()
    })
  ))

  it('converts AMD modules to ES6 modules', () => (
    es6Migrate.migrate().then(() => {
      expect(es6Migrate.convertModules).toHaveBeenCalled()
    })
  ))

  it('lints the JavaScript files', () => (
    es6Migrate.migrate().then(() => {
      expect(es6Migrate.lint).toHaveBeenCalled()
    })
  ))

  it('removes the CoffeeScript files', () => (
    es6Migrate.migrate().then(() => {
      expect(es6Migrate.clean).toHaveBeenCalled()
    })
  ))

  it('logs a success message', () => (
    es6Migrate.migrate().then(() => {
      expect(es6Migrate.handleSuccess).toHaveBeenCalled()
    })
  ))

  describe('on failure', () => {
    beforeEach(function () {
      es6Migrate.convertCoffeeScript = jest.fn(() => Promise.reject())
      es6Migrate.handleError = jest.fn()
    })

    afterEach(() => {
      es6Migrate.handleError.mockReset()
    })

    it('logs an error', () => (
      es6Migrate.migrate().catch(() => {
        expect(es6Migrate.handleError).toHaveBeenCalled()
      })
    ))
  })
})
