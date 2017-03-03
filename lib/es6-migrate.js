import amd2Es6 from '@buxlabs/amd-to-es6'
import { convert } from 'decaffeinate'
import fs from 'fs'
import path from 'path'
import standard from 'standard'

const noContentError = 'You must provide file content.'

class ES6Migrate {
  constructor (files, opts = { extension: '.js' }) {
    if (!files || !files.length) {
      return new Error('You must provide at least one file.')
    }

    this._errors = []
    this._files = files
    this._newExt = opts.extension

    this.clean = this.clean.bind(this)
    this.convertCoffeeScript = this.convertCoffeeScript.bind(this)
    this.convertModules = this.convertModules.bind(this)
    this.handleCompletion = this.handleCompletion.bind(this)
    this.handleError = this.handleError.bind(this)
    this.lint = this.lint.bind(this)
    this.migrate = this.migrate.bind(this)
  }

  /**
   * Remove original CoffeeScript file.
   *
   * @param {String} file   File to remove.
   * @return {Promise}      Promise of file path removed.
   */
  clean (file) {
    if (!file) {
      return new Error('You must provide a file path.')
    }

    return new Promise((resolve, reject) => {
      fs.unlink(file, (err, data) => {
        if (err) {
          reject(err)
        }

        resolve(file)
      })
    })
  }

  /**
   * Convert CoffeeScript to ES6 JavaScript
   *
   * @param {String} file   File content to convert.
   * @return {Promise}      Promise for converted file content.
   */
  convertCoffeeScript (file) {
    if (!file) {
      return new Error(noContentError)
    }

    let es6Content

    return new Promise((resolve, reject) => {
      try {
        es6Content = convert(file).code
      } catch (err) {
        reject(err)
      }

      resolve(es6Content)
    })
  }

  /**
   * Convert AMD module definitions to ES6.
   *
   * @param {String} files  File content to convert.
   * @return {Promise}      Promise for converted file content.
   */
  convertModules (file) {
    if (!file) {
      return new Error(noContentError)
    }

    return new Promise((resolve, reject) => {
      let es6Content

      try {
        es6Content = amd2Es6(file)
      } catch (err) {
        reject(err)
      }

      resolve(es6Content)
    })
  }

  /**
   * Log successful migration message.
   *
   * @return {void}
   */
  handleCompletion () {
    console.log('\nES6 Migration: COMPLETE')

    if (this._errors.length) {
      console.log('\n------Failed Migrations-----')
      this._errors.forEach((error, i) => {
        if (i !== 0) console.log('\n')
        console.log(`${error.key} => ${error.body}`)
      })
      console.log('----------------------------')
    }
  }

  /**
   * Log error from migration failure.
   *
   * @param {String} err   Error message to log.
   * @return {void}
   */
  handleError (err) {
    console.error('ES6 Migration: FAILED', err)
  }

  /**
   * Lint JavaScript with StandardJS, fix violations.
   *
   * @param {String} file   File content to lint.
   * @return {Promise}      Promise for linted file content.
   */
  lint (file) {
    if (!file) {
      return new Error(noContentError)
    }

    return new Promise((resolve, reject) => {
      standard.lintText(file, { fix: true }, (err, data) => {
        if (err) reject(err)

        resolve(data.results[0].output)
      })
    })
  }

  /**
   * Migrate all files, resolve with success or failure log.
   *
   * @return {Promise} Promise for success or error message.
   */
  migrate () {
    return new Promise((resolve, reject) => {
      this.migrateFiles()
        .then(() => {
          this.handleCompletion()
          resolve()
        })
        .catch((err) => {
          this.handleError(err)
          reject(err)
        })
    })
  }

  /**
   * Migration chain of convert CoffeeScript to JavaScript, convert AMD
   * to ES6, fix lint violations, and remove original files.
   *
   * @return {Promise}  Promise all file conversions.
   */
  migrateFiles () {
    console.log('Migrating...')
    const origExt = this._files[0].substr(this._files[0].search(/\./))
    const newExt = this._newExt

    const lastFile = (i) => i === this._files.length - 1

    return new Promise((resolve, reject) => {
      this._files.forEach((file, i) => {
        fs.readFile(file, 'utf8', (err, data) => {
          if (err) {
            this._errors({ key: file, body: err })

            if (lastFile(i)) {
              resolve()
            }

            return
          }

          this.convertCoffeeScript(data)
            .then(this.convertModules)
            .then(this.lint)
            .then((content) => {
              return new Promise((resolve, reject) => {
                const dest = `${path.dirname(file)}/${path.basename(file, origExt)}${newExt}`
                fs.writeFile(dest, content, (err, data) => {
                  if (err) {
                    this._errors.push({ key: file, body: err })

                    reject(err)
                  }

                  resolve(data)
                })
              })
            })
            .then(() => (this.clean(file)))
            .then(() => {
              if (lastFile(i)) resolve()
            })
            .catch((err) => {
              this._errors.push({ key: file, body: err })
              if (lastFile(i)) resolve()
            })
        })
      })
    })
  }
}

module.exports = ES6Migrate
