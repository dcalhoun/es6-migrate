jest.mock('@buxlabs/amd-to-es6')
jest.mock('eslint')
jest.mock('decaffeinate')
jest.mock('fs')
jest.mock('standard')

import amdToEs6 from '@buxlabs/amd-to-es6'
import { convert } from 'decaffeinate'
import fs from 'fs'
import standard from 'standard'

import ES6Migrate from '../es6-migrate'

let es6Migrate, file

describe('ES6Migrate', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate([
      'path/to/foo-1.coffee',
      'path/to/foo-2.coffee',
      'path/to/foo-3.coffee',
      'path/to/foo-4.coffee'
    ])
  })

  describe('#constructor', () => {
    it('assigns an errors array', () => {
      expect(es6Migrate._errors).toBeInstanceOf(Array)
    })

    it('assigns a files array', () => {
      expect(es6Migrate._files).toBeInstanceOf(Array)
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
      convert.mockImplementation((file, opts) => ({ code: 'Converted JavaScript' }))
    })

    afterEach(() => {
      convert.mockClear()
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
        expect(convert).toHaveBeenCalledWith(file, { looseDefaultParams: true, preferConst: true })
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
      amdToEs6.mockImplementation((file) => 'ES6 Modules')
      file = 'AMD Modules'
    })

    afterEach(() => {
      amdToEs6.mockClear()
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
        expect(amdToEs6).toHaveBeenCalledWith(file, { comments: true })
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
      standard.lintText.mockImplementation((file, opts, cb) => {
        const data = {
          results: [{ output: 'Clean JavaScript' }]
        }

        cb(undefined, data)
      })
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
        es6Migrate.migrateFiles = jest.fn(() => Promise.resolve())
        es6Migrate.handleCompletion = jest.fn()
      })

      afterEach(() => {
        es6Migrate.handleCompletion.mockReset()
      })

      it('logs a success message', () => (
        es6Migrate.migrate().then(() => {
          expect(es6Migrate.handleCompletion).toHaveBeenCalled()
        })
      ))
    })

    describe('when a failure occurs', () => {
      beforeEach(() => {
        es6Migrate.migrateFiles = jest.fn(() => Promise.reject())
        es6Migrate.handleError = jest.fn()
      })

      afterEach(() => {
        es6Migrate.migrateFiles.mockReset()
        es6Migrate.handleError.mockReset()
      })

      it('logs an error', () => {
        return es6Migrate.migrate().catch(() => {
          expect(es6Migrate.handleError).toHaveBeenCalled()
        })
      })
    })
  })

  describe('#migrateFiles', () => {
    beforeEach(() => {
      es6Migrate.convertCoffeeScript = jest.fn(() => Promise.resolve())
      es6Migrate.convertModules = jest.fn(() => Promise.resolve())
      es6Migrate.lint = jest.fn(() => Promise.resolve())
      es6Migrate.clean = jest.fn(() => Promise.resolve())
    })

    afterEach(() => {
      es6Migrate.convertCoffeeScript.mockReset()
      es6Migrate.convertModules.mockReset()
      es6Migrate.lint.mockReset()
      es6Migrate.clean.mockReset()

      fs.readFile.mockClear()
      fs.unlink.mockClear()
      fs.writeFile.mockClear()
    })

    it('reads the contents of each file', () => (
      es6Migrate.migrateFiles().then(() => {
        expect(fs.readFile).toHaveBeenCalledTimes(4)
      })
    ))

    it('converts CoffeeScript to JavaScript', () => (
      es6Migrate.migrateFiles().then(() => {
        expect(es6Migrate.convertCoffeeScript).toHaveBeenCalledTimes(4)
      })
    ))

    it('converts AMD modules to ES6 modules', () => (
      es6Migrate.migrateFiles().then(() => {
        expect(es6Migrate.convertModules).toHaveBeenCalledTimes(4)
      })
    ))

    it('lints the JavaScript files', () => (
      es6Migrate.migrateFiles().then(() => {
        expect(es6Migrate.lint).toHaveBeenCalledTimes(4)
      })
    ))

    it('writes each file', () => (
      es6Migrate.migrateFiles().then(() => {
        expect(fs.writeFile).toHaveBeenCalledTimes(4)
      })
    ))

    it('removes the CoffeeScript files', () => (
      es6Migrate.migrateFiles().then(() => {
        expect(es6Migrate.clean).toHaveBeenCalledTimes(4)
      })
    ))

    it('returns a promise', () => {
      expect(es6Migrate.migrateFiles()).toBeInstanceOf(Promise)
    })
  })
})
