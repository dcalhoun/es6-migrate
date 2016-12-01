let standard = {}

standard.lintText = jest.fn((file, opts, cb) => {
  const data = {
    results: [{ output: 'Foo' }]
  }

  cb(undefined, data)
})

module.exports = standard
