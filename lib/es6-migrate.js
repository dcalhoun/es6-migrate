import amd2Es6 from 'amd-to-es6'
import espresso from 'espresso-transformer'
import fs from 'fs'
import path from 'path'
import standard from 'standard'

/**
 * Remove original CoffeeScript file.
 *
 * @param {Array} files   Paths to the files to be removed.
 * @return {Promise}      Promise of an aray of files removed.
 */
let clean = (files) => (
  new Promise((resolve, reject) => {
    try {
      files.forEach((file) => {
        fs.unlinkSync(file)
      })

      resolve(files)
    } catch (err) {
      reject(err)
    }
  })
)

/**
 * Convert CoffeeScript to ES6 JavaScript
 *
 * @param {Array} files   File paths to convert.
 * @return {Promise}      Promise for an array of converted files.
 */
let convertCoffeeScript = (files) => {
  let fileExt = files[0].substr(files[0].search(/\./))
  let opts = {
    backbone: true,
    core: true,
    extension: '.js',
    match: fileExt
  }

  return new Promise((resolve, reject) => {
    try {
      files = files.map((file) => {
        let content = fs.readFileSync(file).toString()
        let es6Content = espresso(content, opts)
        let dest = `${path.dirname(file)}/${path.basename(file, opts.match)}${opts.extension}`

        fs.writeFileSync(dest, es6Content)

        return dest
      })

      resolve(files)
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Convert AMD module definitions to ES6.
 *
 * @param {Array} files   File paths to convert.
 * @return {Promise}      Promise for an array of converted files.
 */
let convertModules = (files) => (
  new Promise((resolve, reject) => {
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
)

/**
 * Log error from migration failure.
 *
 * @param {String} err   Error message to log.
 * @return {void}
 */
let handleError = (err) => { console.error('Migration: Failed', err) }

/**
 * Log successful migration message.
 *
 * @return {void}
 */
let handleSuccess = () => { console.log('Migration: Successful') }

/**
 * Lint JavaScript with StandardJS, fix violations.
 *
 * @param {Array} files   Paths of files to lint.
 * @return {Promise}      Promise for an array of linted files.
 */
let lint = (files) => (
  new Promise((resolve, reject) => {
    try {
      standard.lintFiles(files, { fix: true }, resolve)
    } catch (err) {
      reject(err)
    }
  })
)

/**
 * Migration chain of convert, lint, and clean.
 *
 * @return {void}
 */
let es6Migrate = () => {
  let files = process.argv.splice(2)

  convertCoffeeScript(files)
    .then(convertModules)
    .then(lint)
    .then(() => { clean(files) })
    .then(handleSuccess)
    .catch(handleError)
}

module.exports = es6Migrate
