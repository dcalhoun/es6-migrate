import amd2Es6 from 'amd-to-es6'
import espresso from 'espresso-transformer'
import fs from 'fs'
import path from 'path'
import standard from 'standard'

class ES6Migrate {
  constructor () {
    this.errors = []
  }

  /**
   * Remove original CoffeeScript file.
   *
   * @param {Array} files   Paths to the files to remove.
   * @return {Promise}      Promise of an aray of files removed.
   */
  clean (files) {
    return new Promise((resolve, reject) => {
      try {
        files.forEach((file) => {
          fs.unlinkSync(file)
        })

        resolve(files)
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Convert CoffeeScript to ES6 JavaScript
   *
   * @param {Array} files   File paths to convert.
   * @return {Promise}      Promise for an array of converted files.
   */
  convertCoffeeScript (files) {
    if (!files || !files.length) {
      return new Error('You must provide at least one file.')
    }

    let fileExt = files[0].substr(files[0].search(/\./))
    let opts = {
      backbone: true,
      core: true,
      extension: '.js',
      match: fileExt
    }

    return new Promise((resolve, reject) => {
      files.reduce((accum, file, i, files) => {
        let content, es6Content
        let dest = `${path.dirname(file)}/${path.basename(file, opts.match)}${opts.extension}`

        fs.readFile(file, (err, data) => {
          if (err) {
            this.errors.push({ key: file, body: err })
            return
          }

          content = data.toString()

          try {
            es6Content = espresso(content, opts)
          } catch (err) {
            this.errors.push({ key: file, body: err })
            return
          }

          fs.writeFile(dest, es6Content, (err, data) => {
            if (err) {
              this.errors.push({ key: file, body: err })
              return
            }

            accum.push(dest)

            if (i === files.length - 1) {
              resolve(accum)
            }
          })
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
    return new Promise((resolve, reject) => {
      try {
        files.forEach((file) => {
          let content = fs.readFileSync(file).toString()
          let es6Content = amd2Es6(content)

          fs.writeFileSync(file, es6Content)
        })

        resolve(files)
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Log error from migration failure.
   *
   * @param {String} err   Error message to log.
   * @return {void}
   */
  handleError (err) {
    console.error('Migration: Failed', err)
  }

  /**
   * Log successful migration message.
   *
   * @return {void}
   */
  handleSuccess () {
    console.log('Migration: Successful')
  }

  /**
   * Lint JavaScript with StandardJS, fix violations.
   *
   * @param {Array} files   Paths of files to lint.
   * @return {Promise}      Promise for an array of linted files.
   */
  lint (files) {
    return new Promise((resolve, reject) => {
      try {
        standard.lintFiles(files, { fix: true }, resolve)
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
    return this.convertCoffeeScript(files)
      .then(this.convertModules)
      .then(this.lint)
      .then(() => { this.clean(files) })
      .then(this.handleSuccess)
      .catch(this.handleError)
  }
}

module.exports = ES6Migrate
