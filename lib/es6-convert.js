import { exec } from 'child_process'

/**
 * Remove original CoffeScript file.
 *
 * @return {Promise}
 */
const clean = (path) => {
  return new Promise((resolve, reject) => {
    try {
      exec(`rm ${path}`, resolve)
    } catch (e) {
      reject(Error(e))
    }
  })
}

/**
 * Convert CoffeeScript to ES6 JavaScript
 *
 * @return {Promise}
 */
const convert = (path) => {
  return new Promise((resolve, reject) => {
    try {
      exec(`$(npm bin)/espresso ${path} --bb --match .coffee --extension .js`, resolve)
    } catch (e) {
      reject(Error(e))
    }
  })
}

/**
 * Lint JavaScript with StandardJS, fix violations.
 *
 * @return {Promise}
 */
const lint = (path) => {
  return new Promise((resolve, reject) => {
    try {
      exec(`$(npm bin)/standard --fix ${path.replace(/\.coffee/, '.js')}`, resolve)
    } catch (e) {
      reject(Error(e))
    }
  })
}

// const migrate = (path) => {
//   convert(path)
//     .then(lint.bind(this, path))
//     .then(() => {
//       console.log('Done')
//     }
// })

const migrate = () => {
  console.log('Hello.')
}

export default migrate
