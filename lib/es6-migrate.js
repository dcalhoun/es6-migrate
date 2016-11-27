import amd2Es6 from 'amd-to-es6'
import espresso from 'espresso-transformer'
import fs from 'fs'
import path from 'path'
import standard from 'standard'

const noFileError = 'You must provide at least one file.'

class ES6Migrate {
  constructor (opts = { extension: '.js' }) {
    this._errors = []
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
   * @param {Array} files   Paths to the files to remove.
   * @return {Promise}      Promise of an aray of files removed.
   */
  clean (files, opts = {}) {
    if (!files || !files.length) {
      return new Error(noFileError)
    }

    let fileCount = 0

    return new Promise((resolve, reject) => {
      files.map((file, i) => (
        `${path.dirname(file)}/${path.basename(file, opts.newExt)}${opts.origExt}`
      )).forEach((file, i) => {
        fileCount++

        fs.unlink(file, (err, data) => {
          if (err) {
            this._errors.push({ key: file, body: err })
          }

          if (fileCount === files.length) {
            resolve(files)
          }
        })
      })

      resolve(files)
    })
  }

  /**
   * Convert CoffeeScript to ES6 JavaScript
   *
   * @param {Array} files   File paths to convert.
   * @return {Promise}      Promise for an array of converted files.
   */
  convertCoffeeScript (files, opts = {}) {
    if (!files || !files.length) {
      return new Error(noFileError)
    }

    let fileCount = 0

    return new Promise((resolve, reject) => {
      files.reduce((accum, file, i, files) => {
        let errOccured = false
        let es6Content
        const dest = `${path.dirname(file)}/${path.basename(file, opts.origExt)}${opts.newExt}`

        fs.readFile(file, (err, data) => {
          if (err) {
            errOccured = true
            this._errors.push({ key: file, body: err })
          }

          let content = data.toString()

          try {
            es6Content = espresso(content, { backbone: true })
          } catch (err) {
            errOccured = true
            this._errors.push({ key: file, body: err })
          }

          if (errOccured) {
            fileCount++
            fileCount === files.length && resolve(accum)
          } else {
            fs.writeFile(dest, es6Content, (err, data) => {
              if (err) {
                errOccured = true
                this._errors.push({ key: file, body: err })
              }

              if (!errOccured) {
                accum.push(dest)
              }

              fileCount++

              if (fileCount === files.length) {
                resolve(accum)
              }
            })
          }
        })

        return accum
      }, [])
    })
  }

  /**
   * Convert AMD module definitions to ES6.
   *
   * @param {Array} files   File paths to convert.
   * @return {Promise}      Promise for an array of converted files.
   */
  convertModules (files) {
    if (!files || !files.length) {
      return new Error(noFileError)
    }

    let fileCount = 0

    return new Promise((resolve, reject) => {
      files.forEach((file) => {
        let content, es6Content
        fs.readFile(file, (err, data) => {
          if (err) {
            this._errors.push({ key: file, body: err })
          }

          content = data.toString()

          try {
            es6Content = amd2Es6(content)
          } catch (err) {
            this._errors.push({ key: file, body: err })
          }

          fs.writeFile(file, es6Content, (err) => {
            if (err) {
              this._errors.push({ key: file, body: err })
            }

            fileCount++

            if (fileCount === files.length) {
              resolve(files)
            }
          })
        })
      })
    })
  }

  /**
   * Log successful migration message.
   *
   * @return {void}
   */
  handleCompletion () {
    console.log('ES6 Migration: COMPLETE')

    if (this._errors.length) {
      console.log('\n------Failed Migrations-----')
      this._errors.forEach((error) => {
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
   * @param {Array} files   Paths of files to lint.
   * @return {Promise}      Promise for an array of linted files.
   */
  lint (files) {
    if (!files || !files.length) {
      return new Error(noFileError)
    }

    return new Promise((resolve, reject) => {
      try {
        standard.lintFiles(files, { fix: true }, () => {
          resolve(files)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Migration chain of convert CoffeeScript to JavaScript, convert AMD
   * to ES6, fix lint violations, and remove original files.
   *
   * @param {Array} files   Paths of files to migrate.
   * @return {Promise}      Promise for sucess or error message.
   */
  migrate (files) {
    if (!files || !files.length) {
      return new Error(noFileError)
    }

    const opts = {
      origExt: files[0].substr(files[0].search(/\./)),
      newExt: this._newExt
    }

    return new Promise((resolve, reject) => {
      this.convertCoffeeScript(files, opts)
        .then(this.convertModules)
        .then(this.lint)
        .then((files) => (
          this.clean(files, opts)
        ))
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
}

module.exports = ES6Migrate
