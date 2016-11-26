let standard = {}

standard.lintFiles = jest.fn((files, opts, cb) => {
  cb()
})

module.exports = standard
