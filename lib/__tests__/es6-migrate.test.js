jest.mock('amd-to-es6')
jest.mock('eslint')
jest.mock('espresso-transformer')
jest.mock('fs')
jest.mock('standard')

import amd2Es6 from 'amd-to-es6'
import espresso from 'espresso-transformer'
import fs from 'fs'
import ProgressBar from 'node-progress-bars'
import standard from 'standard'

import ES6Migrate from '../es6-migrate'

let es6Migrate, file

describe('ES6Migrate', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate(['path/to/foo.coffee'])
  })

  describe('#constructor', () => {
    it('assigns an errors array', () => {
      expect(es6Migrate._errors).toBeInstanceOf(Array)
    })

    it('assigns a files array', () => {
      expect(es6Migrate._files).toBeInstanceOf(Array)
    })

    it('assigns a progress bar', () => {
      expect(es6Migrate._progress).toBeInstanceOf(ProgressBar)
    })

    it('assigns an extension', () => {
      expect(es6Migrate._newExt).toBeDefined()
    })
  })

  describe('#clean', () => {
    beforeEach(() => {
      file = 'path/to/clean-1.coffee'
    })

    afterEach(() => {
      fs.unlink.mockClear()
    })

    describe('when passed no file', () => {
      it('throws an error', () => {
        expect(es6Migrate.clean()).toEqual(new Error(
          'You must provide a file path.'
        ))
      })
    })

    describe('when passed files', () => {
      it('removes the passed file', () => {
        es6Migrate.clean(file)
        expect(fs.unlink).toHaveBeenCalledWith(file, jasmine.any(Function))
      })

      it('returns the file path removed', () => (
        es6Migrate.clean(file).then((resp) => {
          expect(resp).toEqual('path/to/clean-1.coffee')
        })
      ))
    })
  })

  describe('#convertCoffeeScript', () => {
    beforeEach(() => {
      file = 'Old CoffeeScript'
      espresso.mockImplementation((file, opts) => 'Converted JavaScript')
    })

    afterEach(() => {
      espresso.mockClear()
    })

    describe('when passed no file', () => {
      it('throws an error', () => {
        expect(es6Migrate.convertCoffeeScript()).toEqual(new Error(
          'You must provide file content.'
        ))
      })
    })

    describe('when passed a file', () => {
      it('converts the file content to JavaScript', () => {
        es6Migrate.convertCoffeeScript(file)
        expect(espresso).toHaveBeenCalledWith(file, { backbone: true })
      })

      it('returns the converted JavaScript', () => (
        es6Migrate.convertCoffeeScript(file).then((resp) => {
          expect(resp).toEqual('Converted JavaScript')
        })
      ))
    })
  })

  describe('#convertModules', () => {
    beforeEach(() => {
      amd2Es6.mockImplementation((file) => 'ES6 Modules')
      file = 'AMD Modules'
    })

    afterEach(() => {
      amd2Es6.mockClear()
    })

    describe('when passed no file', () => {
      it('throws an error', () => {
        expect(es6Migrate.convertModules()).toEqual(new Error(
          'You must provide file content.'
        ))
      })
    })

    describe('when passed a file', () => {
      it('converts AMD modules to ES6 modules', () => {
        es6Migrate.convertModules(file)
        expect(amd2Es6).toHaveBeenCalledWith(file)
      })

      it('returns the files with converted modules', () => (
        es6Migrate.convertModules(file).then((resp) => {
          expect(resp).toEqual('ES6 Modules')
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
    beforeEach(() => {
      file = 'Inconsistent JavaScript'
      standard.lintText.mockImplementation((file, opts, cb) =>
        cb(undefined, 'Clean JavaScript')
      )
    })

    afterEach(() => {
      standard.lintText.mockClear()
    })

    describe('when passed no file', () => {
      it('throws an error', () => {
        expect(es6Migrate.lint()).toEqual(new Error(
          'You must provide file content.'
        ))
      })
    })

    describe('when passed files', () => {
      it('repairs lint violations', () => (
        es6Migrate.lint(file).then(() => {
          expect(standard.lintText).toHaveBeenCalled()
        })
      ))

      it('returns then linted content', () => {
        es6Migrate.lint(file).then((resp) => {
          expect(resp).toEqual('Clean JavaScript')
        })
      })
    })
  })

  describe('#migrate', () => {
    describe('when successful', () => {
      beforeEach(() => {
        es6Migrate.convertCoffeeScript = jest.fn(() => Promise.resolve())
        es6Migrate.convertModules = jest.fn(() => Promise.resolve())
        es6Migrate.lint = jest.fn(() => Promise.resolve())
        es6Migrate.clean = jest.fn(() => Promise.resolve())
        es6Migrate.handleCompletion = jest.fn()
      })

      afterEach(() => {
        es6Migrate.convertCoffeeScript.mockReset()
        es6Migrate.convertModules.mockReset()
        es6Migrate.lint.mockReset()
        es6Migrate.clean.mockReset()
        es6Migrate.handleCompletion.mockReset()

        fs.readFile.mockClear()
        fs.unlink.mockClear()
        fs.writeFile.mockClear()
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

    describe('when a failure occurs', () => {
      beforeEach(() => {
        es6Migrate.convertCoffeeScript = jest.fn(() => Promise.reject())
        es6Migrate.handleError = jest.fn()
      })

      afterEach(() => {
        es6Migrate.convertCoffeeScript.mockReset()
        es6Migrate.handleError.mockReset()
      })

      it('logs an error', () => {
        return es6Migrate.migrate().catch(() => {
          expect(es6Migrate.handleError).toHaveBeenCalled()
        })
      })
    })
  })
})
