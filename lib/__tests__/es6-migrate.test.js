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

  it('assigns an errors Array', function () {
    expect(es6Migrate.errors).toBeInstanceOf(Array)
  })

  describe('#clean', () => {
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
      it('throws an error', () => (
        expect(es6Migrate.convertCoffeeScript()).toEqual(new Error(
          'You must provide at least one file.'
        ))
      ))
    })

    describe('when passed files', () => {
      it('reads the files', () => (
        es6Migrate.convertCoffeeScript(files).then(() => (
          expect(fs.readFile).toHaveBeenCalledTimes(3)
        ))
      ))

      it('converts the files to JavaScript', () => (
        es6Migrate.convertCoffeeScript(files).then(() => (
          expect(espresso).toHaveBeenCalledTimes(3)
        ))
      ))

      it('writes the JavaScript files', () => (
        es6Migrate.convertCoffeeScript(files).then(() => (
          expect(fs.writeFile).toHaveBeenCalledTimes(3)
        ))
      ))

      it('returns an array of destination files', () => (
        es6Migrate.convertCoffeeScript(files).then((resp) => (
          expect(resp).toEqual([
            'path/to/foo.js',
            'path/to/bar.js',
            'path/to/baz.js'
          ])
        ))
      ))
    })
  })

  describe('#convertModules', () => {
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
        es6Migrate.convertModules(files).then(() => (
          expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
        ))
      ))

      it('calls amd2Es6', () => (
        es6Migrate.convertModules(files).then(() => (
          expect(amd2Es6).toHaveBeenCalledTimes(1)
        ))
      ))
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

  describe('#handleSuccess', () => {
    beforeEach(() => {
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

  describe('#lint', () => {
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

  describe('#migrate', () => {
    beforeEach(() => {
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
})
