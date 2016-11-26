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
const opts = {
  newExt: '.js',
  origExt: '.coffee'
}

describe('ES6Migrate', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate()
  })

  it('assigns an errors array', () => {
    expect(es6Migrate._errors).toBeInstanceOf(Array)
  })

  it('assigns an extension', () => {
    expect(es6Migrate._newExt).toBeDefined()
  })

  describe('#clean', () => {
    afterEach(() => {
      fs.unlink.mockClear()
    })

    describe('when passed no files', () => {
      it('throws an error', () => {
        expect(es6Migrate.clean()).toEqual(new Error(
          'You must provide at least one file.'
        ))
      })
    })

    describe('when passed files', () => {
      beforeEach(() => {
        files = [
          'path/to/clean-1.coffee',
          'path/to/clean-2.coffee'
        ]
      })

      it('removes the passed files', () => {
        es6Migrate.clean(files, opts)
        expect(fs.unlink).toHaveBeenCalledTimes(2)
      })

      it('returns an array of removed files', () => (
        es6Migrate.clean(files, opts).then((resp) => {
          expect(resp).toEqual([
            'path/to/clean-1.coffee',
            'path/to/clean-2.coffee'
          ])
        })
      ))
    })
  })

  describe('#convertCoffeeScript', () => {
    afterEach(() => {
      espresso.mockClear()
      fs.readFile.mockClear()
      fs.writeFile.mockClear()
    })

    describe('when passed no files', () => {
      it('throws an error', () => {
        expect(es6Migrate.convertCoffeeScript()).toEqual(new Error(
          'You must provide at least one file.'
        ))
      })
    })

    describe('when passed files', () => {
      beforeEach(() => {
        files = [
          'path/to/convert-coffeescript-1.coffee',
          'path/to/convert-coffeescript-2.coffee',
          'path/to/convert-coffeescript-3.coffee'
        ]
      })

      it('reads the files', () => {
        es6Migrate.convertCoffeeScript(files, opts)
        expect(fs.readFile).toHaveBeenCalledTimes(3)
      })

      it('converts the files to JavaScript', () => {
        es6Migrate.convertCoffeeScript(files, opts)
        expect(espresso).toHaveBeenCalledTimes(3)
      })

      it('writes the JavaScript files', () => {
        es6Migrate.convertCoffeeScript(files, opts)
        expect(fs.writeFile).toHaveBeenCalledTimes(3)
      })

      it('returns an array of destination files', () => (
        es6Migrate.convertCoffeeScript(files, opts).then((resp) => {
          expect(resp).toEqual([
            'path/to/convert-coffeescript-1.js',
            'path/to/convert-coffeescript-2.js',
            'path/to/convert-coffeescript-3.js'
          ])
        })
      ))
    })
  })

  describe('#convertModules', () => {
    afterEach(() => {
      amd2Es6.mockClear()
      fs.readFile.mockClear()
      fs.writeFile.mockClear()
    })

    describe('when passed no files', () => {
      it('throws an error', () => {
        expect(es6Migrate.convertModules()).toEqual(new Error(
          'You must provide at least one file.'
        ))
      })
    })

    describe('when passed files', () => {
      beforeEach(() => {
        files = [
          'path/to/convert-amd.coffee'
        ]
      })

      it('reads the files', () => {
        es6Migrate.convertModules(files)
        expect(fs.readFile).toHaveBeenCalledTimes(1)
      })

      it('converts AMD modules to ES6 modules', () => {
        es6Migrate.convertModules(files)
        expect(amd2Es6).toHaveBeenCalledTimes(1)
      })

      it('writes the files', () => {
        es6Migrate.convertModules(files)
        expect(fs.writeFile).toHaveBeenCalledTimes(1)
      })

      it('returns an array of converted files', () => (
        es6Migrate.convertModules(files).then((resp) => {
          expect(resp).toEqual([
            'path/to/convert-amd.coffee'
          ])
        })
      ))
    })
  })

  describe('#handleCompletion', () => {
    beforeEach(() => {
      console.log = jest.fn()
      es6Migrate.handleCompletion()
    })

    afterEach(() => {
      console.log.mockReset()
    })

    it('logs a completion message', () => {
      expect(console.log).toHaveBeenCalled()
    })
  })

  describe('#handleError', () => {
    beforeEach(() => {
      console.error = jest.fn()
      es6Migrate.handleError(new Error('Something went wrong.'))
    })

    afterEach(() => {
      console.error.mockReset()
    })

    it('logs the error', () => {
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('#lint', () => {
    afterEach(() => {
      standard.lintFiles.mockClear()
    })

    describe('when passed no files', () => {
      it('throws an error', () => {
        expect(es6Migrate.lint()).toEqual(new Error(
          'You must provide at least one file.'
        ))
      })
    })

    describe('when passed files', () => {
      beforeEach(() => {
        files = [
          'path/to/lint-1.coffee',
          'path/to/lint-2.coffe',
          'path/to/lint-3.coffe'
        ]
      })

      it('returns an array of linted files', () => {
        es6Migrate.lint(files).then((resp) => {
          expect(resp).toEqual([
            'path/to/lint-1.coffee',
            'path/to/lint-2.coffe',
            'path/to/lint-3.coffe'
          ])
        })
      })

      it('repairs lint violations', () => (
        es6Migrate.lint(files).then(() => {
          expect(standard.lintFiles).toHaveBeenCalled()
        })
      ))
    })
  })

  describe('#migrate', () => {
    beforeEach(() => {
      es6Migrate.convertCoffeeScript = jest.fn(() => Promise.resolve())
      es6Migrate.convertModules = jest.fn(() => Promise.resolve())
      es6Migrate.lint = jest.fn(() => Promise.resolve())
      es6Migrate.clean = jest.fn(() => Promise.resolve())
      es6Migrate.handleCompletion = jest.fn()
      es6Migrate.handleError = jest.fn()

      files = [
        'path/to/migrate-1.coffee',
        'path/to/migrate-2.coffee',
        'path/to/migrate-3.coffee',
        'path/to/migrate-4.coffee'
      ]
    })

    afterEach(() => {
      es6Migrate.convertCoffeeScript.mockReset()
      es6Migrate.convertModules.mockReset()
      es6Migrate.lint.mockReset()
      es6Migrate.clean.mockReset()
      es6Migrate.handleCompletion.mockReset()
      es6Migrate.handleError.mockReset()
    })

    describe('when passed no files', () => {
      it('throws an error', () => {
        expect(es6Migrate.migrate()).toEqual(new Error(
          'You must provide at least one file.'
        ))
      })
    })

    describe('when passed files', () => {
      it('converts CoffeeScript to JavaScript', () => (
        es6Migrate.migrate(files).then(() => {
          expect(es6Migrate.convertCoffeeScript).toHaveBeenCalled()
        })
      ))

      it('converts AMD modules to ES6 modules', () => (
        es6Migrate.migrate(files).then(() => {
          expect(es6Migrate.convertModules).toHaveBeenCalled()
        })
      ))

      it('lints the JavaScript files', () => (
        es6Migrate.migrate(files).then(() => {
          expect(es6Migrate.lint).toHaveBeenCalled()
        })
      ))

      it('removes the CoffeeScript files', () => (
        es6Migrate.migrate(files).then(() => {
          expect(es6Migrate.clean).toHaveBeenCalled()
        })
      ))

      it('logs a success message', () => (
        es6Migrate.migrate(files).then(() => {
          expect(es6Migrate.handleCompletion).toHaveBeenCalled()
        })
      ))
    })

    describe('when a failure occurs', () => {
      beforeEach(() => {
        es6Migrate.convertCoffeeScript = jest.fn(() => Promise.reject())
        es6Migrate.handleError = jest.fn()
      })

      afterEach(() => {
        es6Migrate.handleError.mockReset()
      })

      it('logs an error', () => (
        es6Migrate.migrate(files).catch(() => {
          expect(es6Migrate.handleError).toHaveBeenCalled()
        })
      ))
    })
  })
})
