var espresso = require('espresso-transformer')
var fs = require('fs')
var path = require('path')
var standard = require('standard')

/**
 * Build an array of files based on provided path.
 *
 * @param {String} path Path to file or directory of files.
 * @return {Array}
 */
var buildFilesArray = function (filePath, opts) {
  var files = []
  var filePathStats = fs.lstatSync(filePath)

  filePath = filePath.slice(-1) === '/' ? filePath.slice(0, -1) : filePath

  if (filePathStats.isDirectory()) {
    files = fs.readdirSync(filePath).map(function (file) {
      return filePath + '/' + file
    })
  } else if (filePathStats.isFile()) {
    files.push(filePath)
  }

  return files.filter(function (file) {
    return path.extname(file) === opts.match
  })
}

/**
 * Remove original CoffeeScript file.
 *
 * @param {Array} files   Paths to the files to be removed.
 * @return {Promise}
 */
var clean = function (files) {
  return new Promise(function (resolve, reject) {
    try {
      files.forEach(function (file) {
        fs.unlinkSync(file)
      })

      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Convert CoffeeScript to ES6 JavaScript
 *
 * @param {Array} files   Paths of files to be converted.
 * @return {Promise}
 */
var convert = function (files, opts) {
  return new Promise(function (resolve, reject) {
    try {
      files.forEach(function (file) {
        var content = fs.readFileSync(file).toString()
        var es6Content = espresso(content, opts)

        fs.writeFileSync(
          path.dirname(file) + '/' + path.basename(file, opts.match) + opts.extension, es6Content
        )
      })

      resolve()
    } catch (e) {
      reject()
    }
  })
}

/**
 * Lint JavaScript with StandardJS, fix violations.
 *
 * @param {Array} files   Paths of files to be fixed.
 * @return {Promise}
 */
var lint = function (files) {
  return new Promise(function (resolve, reject) {
    try {
      standard.lintFiles(files, { fix: true }, resolve)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Migration chain of convert, lint, and clean.
 *
 * @return {void}
 */
var migrate = function () {
  var opts = {
    backbone: true,
    core: true,
    extension: '.js',
    match: '.coffee'
  }
  var filePath = process.argv.splice(2).shift()
  var files = buildFilesArray(filePath, opts)
  var dests = files.map(function (item) {
    return item.replace(/\.coffee/, '.js')
  })

  convert(files, opts)
    .then(lint.bind(this, dests))
    .then(clean.bind(this, files))
    .then(function () {
      console.log('Migration: Successful')
    }).catch(function (err) {
      console.error('Migration: Failed', err)
    })
}

module.exports = migrate
