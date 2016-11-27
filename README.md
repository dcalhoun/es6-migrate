# es6-migrate
[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
[![Build Status](https://travis-ci.org/dcalhoun/es6-migrate.svg?branch=master)](https://travis-ci.org/dcalhoun/es6-migrate)

Convert AMD CoffeeScript to ES6 JavaScript. Tasks performed:
- CoffeeScript => JavaScript
- AMD Modules => ES6 Modules
- Fix StandardJS violations
- Remove original CoffeeScript files

## Installation

```bash
npm install es6-migrate
```

## Usage
```bash
es6Migrate <files> <options>
```

### Options

| Name        | Excepted   | Default | Description                                    |
| ----        | --------   | ------- | -----------                                    |
| `files`     | `{Array}`  | n/a     | Array of files to migrate.                     |
| `extension` | `{String}` | `.js`   | Extension to use when writing converted files. |

### Examples
```bash
# Single file
es6Migrate ./src/scripts/index.coffee

# Directory of files
es6Migrate ./src/scripts/**/*.js.coffee

# Write converted files with an`.es6.js` file extension
es6Migrate ./src/scripts/**/*.coffee --extension .es6.js
```

## Testing
[Jest](http://facebook.github.io/jest/) is the test runner used for this project.

```bash
# Run the tests
npm test

# Run the tests in interactive mode
npm test:watch
```
