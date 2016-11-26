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
  beforeEach(function () {
    es6Migrate = new ES6Migrate()
  })

  it('assigns an errors array', function () {
    expect(es6Migrate.errors).toBeInstanceOf(Array)
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
          'path/to/foo.coffee',
          'path/to/bar.coffee'
        ]
      })

      it('removes the passed files', () => {
        es6Migrate.clean(files)
        expect(fs.unlink).toHaveBeenCalledTimes(2)
      })

      it('returns an array of removed files', () => {
        es6Migrate.clean(files).then((resp) => {
          expect(resp).toEqual([
            'path/to/foo.coffee',
            'path/to/bar.coffee'
          ])
        })
      })
    })
  })

  describe('#convertCoffeeScript', () => {
    beforeEach(() => {
      files = [
        'path/to/foo.coffee',
        'path/to/bar.coffee',
        'path/to/baz.coffee'
      ]
    })

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
          'path/to/foo.coffee',
          'path/to/bar.coffee',
          'path/to/baz.coffee'
        ]
      })

      it('reads the files', () => {
        es6Migrate.convertCoffeeScript(files)
        expect(fs.readFile).toHaveBeenCalledTimes(3)
      })

      it('converts the files to JavaScript', () => {
        es6Migrate.convertCoffeeScript(files)
        expect(espresso).toHaveBeenCalledTimes(3)
      })

      it('writes the JavaScript files', () => {
        es6Migrate.convertCoffeeScript(files)
        expect(fs.writeFile).toHaveBeenCalledTimes(3)
      })

      it('returns an array of destination files', () => {
        es6Migrate.convertCoffeeScript(files).then((resp) => {
          expect(resp).toEqual([
            'path/to/foo.js',
            'path/to/bar.js',
            'path/to/baz.js'
          ])
        })
      })
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
        files = ['path/to/foo.coffee']
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

      it('returns an array of converted files', () => {
        es6Migrate.convertModules(files).then((resp) => {
          expect(resp).toEqual([
            'path/to/foo.coffee'
          ])
        })
      })
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
      es6Migrate.handleError([{
        key: 'foo.coffee',
        body: 'Failed to convert.'
      }])
    })

    afterEach(() => {
      console.error.mockReset()
    })

    it('logs the error', () => {
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('#lint', () => {
    afterEach(function () {
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
          'path/to/foo.coffee',
          'path/to/bar.coffe',
          'path/to/baz.coffe'
        ]
      })

      it('returns an array of linted files', () => {
        es6Migrate.lint(files).then((resp) => {
          expect(resp).toEqual([
            'path/to/foo.coffee',
            'path/to/bar.coffe',
            'path/to/baz.coffe'
          ])
        })
      })

      it('repairs lint violations', () => {
        es6Migrate.lint(files).then(() => {
          expect(standard.lintFiles).toHaveBeenCalled()
        })
      })
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
        es6Migrate.migrate().then(() => {
          expect(es6Migrate.handleError).toHaveBeenCalled()
        })
      })
    })

    describe('when passed files', () => {
      beforeEach(() => {
        files = [
          'path/to/foo.coffee',
          'path/to/bar.coffee',
          'path/to/baz.coffee'
        ]
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
          expect(es6Migrate.handleCompletion).toHaveBeenCalled()
        })
      ))
    })

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
})
