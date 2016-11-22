# es6-migrate
[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
[![Build Status](https://travis-ci.org/dcalhoun/es6-migrate.svg?branch=master)](https://travis-ci.org/dcalhoun/es6-migrate)

Convert CoffeeScript to JavaScript. Conversions performed:
- CoffeeScript => JavaScript
- AMD => ES6 Modules
- Fix StandardJS violations
- Delete original CoffeeScript files

## Installation

```bash
npm install es6-migrate
```

## Usage
```bash
es6Migrate <files>
```

### Options
#### `files`
Array of files to migrate.

###### Accepted Values
- `{Array}`

###### Examples
```bash
# Example: Single file
es6Migrate ./src/scripts/index.coffee

# Example: Directory of files
es6Migrate ./src/scripts/**/*.coffee
```

## Testing
[Jest](http://facebook.github.io/jest/) is the test runner used for this project.

```bash
# Run the tests
npm test

# Run the tests in interactive mode
npm test:watch
```
