let fs = jest.genMockFromModule('fs')

fs.readFileSync = jest.fn((file) => (`Text content for ${file}.`))
fs.unlinkSync = jest.fn()
fs.writeFileSync = jest.fn()

fs.readFile = jest.fn((file, cb) => {
  cb(undefined, `Text content for ${file}.`)
})

fs.unlink = jest.fn()

fs.writeFile = jest.fn((dest, content, cb) => {
  cb()
})

module.exports = fs
