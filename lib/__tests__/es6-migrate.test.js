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

let es6Migrate, files, file
const opts = {
  newExt: '.js',
  origExt: '.coffee'
}

describe('ES6Migrate', () => {
  beforeEach(() => {
    es6Migrate = new ES6Migrate(['path/to/foo.coffee'])
  })

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
    expect(es6Migrate._newExt).toBeInstanceOf(String)
  })

  describe('#clean', () => {
    afterEach(() => {
      fs.unlink.mockClear()
    })

    describe('when passed no file', () => {
      it('throws an error', () => {
        expect(es6Migrate.clean()).toEqual(new Error(
          'You must a provide file path.'
        ))
      })
    })

    describe('when passed files', () => {
      beforeEach(() => {
        file = 'path/to/clean-1.coffee'
      })

      it('removes the passed file', () => {
        es6Migrate.clean(file)
        expect(fs.unlink).toHaveBeenCalledWith(file)
      })

      it('returns the file path removed', () => (
        es6Migrate.clean(files).then((resp) => {
          expect(resp).toEqual('path/to/clean-1.coffee')
        })
      ))
    })
  })

  describe('#convertCoffeeScript', () => {
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
      beforeEach(() => {
        file = `foo = -> @bar = 'baz'`
      })

      it('converts the file content to JavaScript', () => {
        es6Migrate.convertCoffeeScript(file)
        expect(espresso).toHaveBeenCalledWith(file)
      })

      it('returns the converted JavaScript', () => (
        es6Migrate.convertCoffeeScript(file).then((resp) => {
          expect(resp).toEqual(`
            var foo = function() {
              this.bar = 'baz';
            };
          `)
        })
      ))
    })
  })

  describe('#convertModules', () => {
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
      beforeEach(() => {
        file = `
          var foo = require('foo');
        `
      })

      it('converts AMD modules to ES6 modules', () => {
        es6Migrate.convertModules(file)
        expect(amd2Es6).toHaveBeenCalledwWith(file)
      })

      it('returns the converted modules', () => (
        es6Migrate.convertModules(files).then((resp) => {
          expect(resp).toEqual(`
            import foo from 'foo';
          `)
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

    describe('when passed no file', () => {
      it('throws an error', () => {
        expect(es6Migrate.lint()).toEqual(new Error(
          'You must provide file content.'
        ))
      })
    })

    describe('when passed files', () => {
      beforeEach(() => {
        file = `
          var foo = function() {
            this.bar = 'baz';
          };
        `
      })

      it('repairs lint violations', () => (
        es6Migrate.lint(files).then(() => {
          expect(standard.lintText).toHaveBeenCalled()
        })
      ))

      it('returns then linted content', () => {
        es6Migrate.lint(files).then((resp) => {
          expect(resp).toEqual(`
            var foo = function () {
              this.bar = 'baz'
            }
          `)
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
      fs.readFile.mockClear()
      fs.unlink.mockClear()
      fs.writeFile.mockClear()
    })

    describe('when passed no files', () => {
      it('throws an error', () => {
        expect(es6Migrate.migrate()).toEqual(new Error(
          'You must provide at least one file.'
        ))
      })
    })

    describe('when passed files', () => {
      beforeEach(function () {
        files = [
          'path/to/migrate-1.coffee',
          'path/to/migrate-2.coffee',
          'path/to/migrate-3.coffee',
          'path/to/migrate-4.coffee'
        ]

        es6Migrate = new ES6Migrate(files)
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
        es6Migrate = new ES6Migrate()
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
