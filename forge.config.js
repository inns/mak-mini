const platform = require('os').platform()

const VERSION = require('./package.json').version

module.exports = {
  "packagerConfig": {
    "icon": platform === 'darwin' ? './Icon.icns' : './Icon.ico',
    "appVersion": VERSION,
    "ignore": [
      ".*\\.md",
      "screenshot",
      "example",
      "test"
    ],
  },
}