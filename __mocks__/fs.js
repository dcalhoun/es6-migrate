let fs = jest.genMockFromModule('fs')

fs.readFileSync = jest.fn((file) => (
  `Text content for ${file}.`
))
fs.unlinkSync = jest.fn()
fs.writeFileSync = jest.fn()

module.exports = fs
