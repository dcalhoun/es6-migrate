var amd2Es6 = require('amd-to-es6')
var espresso = require('espresso-transformer')
var fs = require('fs')
var path = require('path')
var standard = require('standard')

/**
 * Remove original CoffeeScript file.
 *
 * @param {Array} files   Paths to the files to be removed.
 * @return {Promise}      Promise of an aray of files removed.
 */
var clean = function (files) {
  return new Promise(function (resolve, reject) {
    try {
      files.forEach(function (file) {
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
var convertCoffeeScript = function (files) {
  var fileExt = files[0].substr(files[0].search(/\./))
  var opts = {
    backbone: true,
    core: true,
    extension: '.js',
    match: fileExt
  }

  return new Promise(function (resolve, reject) {
    try {
      files = files.map(function (file) {
        var content = fs.readFileSync(file).toString()
        var es6Content = espresso(content, opts)
        var dest = path.dirname(file) + '/' + path.basename(file, opts.match) + opts.extension

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
var convertModules = function (files) {
  return new Promise(function (resolve, reject) {
    try {
      files.forEach(function (file) {
        var content = fs.readFileSync(file).toString()
        var es6Content = amd2Es6(content, { beautify: true })

        fs.writeFileSync(file, es6Content)
      })

      resolve(files)
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Lint JavaScript with StandardJS, fix violations.
 *
 * @param {Array} files   Paths of files to lint.
 * @return {Promise}      Promise for an array of linted files.
 */
var lint = function (files) {
  return new Promise(function (resolve, reject) {
    try {
      standard.lintFiles(files, { fix: true }, resolve)
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Migration chain of convert, lint, and clean.
 *
 * @return {void}
 */
var migrate = function () {
  var files = process.argv.splice(2)

  convertCoffeeScript(files)
    .then(convertModules)
    .then(lint)
    .then(clean.bind(this, files))
    .then(function () {
      console.log('Migration: Successful')
    }).catch(function (err) {
      console.error('Migration: Failed', err)
    })
}

module.exports = migrate
