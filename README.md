# es6-migrate
[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
[![Build Status](https://travis-ci.org/dcalhoun/es6-migrate.svg?branch=master)](https://travis-ci.org/dcalhoun/es6-migrate)

Convert CoffeeScript to ES6 and fix StandardJS violations.

## Installation

```bash
npm install es6-migrate
```

## Usage
```bash
es6Migrate path/to/file.coffee
```

### Options
#### `files`
String path to file or directory of files to migrate.

###### Accepted Values
- `{String}`

###### Examples
```javascript
// Example: Single file
es6Migrate ./src/scripts/index.coffee

// Example: Directory of files
es6Migrate ./src/scripts/feature/
```

## Testing

```bash
npm test
```
