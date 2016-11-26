let fs = jest.genMockFromModule('fs')

fs.readFile = jest.fn((file, cb) => {
  cb(undefined, `Text content for ${file}.`)
})

fs.unlink = jest.fn((path, cb) => {
  cb()
})

fs.writeFile = jest.fn((dest, content, cb) => {
  cb()
})

module.exports = fs
