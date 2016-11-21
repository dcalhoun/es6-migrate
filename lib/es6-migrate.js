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
var convert = function (files) {
  var firstFile = files.shift()
  var fileExt = firstFile.substr(firstFile.search(/\./))
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

  convert(files).then(lint).then(clean.bind(this, files))
    .then(function () {
      console.log('Migration: Successful')
    }).catch(function (err) {
      console.error('Migration: Failed', err)
    })
}

module.exports = migrate
