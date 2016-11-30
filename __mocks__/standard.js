let standard = {}

standard.lintText = jest.fn((file, opts, cb) => {
  cb(undefined, 'Foo')
})

module.exports = standard
