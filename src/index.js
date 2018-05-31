const path = require('path')
const platform = require('os').platform()
const menubar = require('menubar')
const { BrowserWindow, Menu, shell } = require('electron')

const addTouchbar = require('./touchbar')
const addContextmenu = require('./contextmenu')
const { bindMak } = require('./status')

const { IS_DEV } = require('./env')
const { URL_MAK, URL_AUTH } = require('./config')
const WIDTH = 400
const HEIGHT = 600

const mb = menubar({
  icon: path.join(__dirname, '..', 'assets', `${platform}-IconTemplate.png`),
  index: URL_MAK,
  preloadWindow: true,
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: 'white',
  // alwaysOnTop: true
})

mb.on('ready', function() {
  mb.window.setSkipTaskbar(true)

  mb.window.webContents.on('did-finish-load', function() {
    mb.window.webContents.executeJavaScript(';window.IS_MAK_MINI = true;')
    // setInterval(tick, 500)
  })

  mb.window.webContents.on('will-navigate', function(event, url) {
    if (!url.startsWith(URL_MAK)) {
      // external links
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  mb.window.webContents.on('new-window', function(event, url, frameName, disposition, options, additionalFeatures) {
    if (url.startsWith(URL_AUTH) || url.startsWith(URL_MAK)) {
      event.preventDefault()
      Object.assign(options, {
        modal: false,
        frame: true,
        parent: mb.window,
      })

      let window = new BrowserWindow(options)
      event.newGuest = window

      mb.setOption('alwaysOnTop', true)

      window.loadURL(url)
      window.show()

      // Trick to keep the menubar app focused
      window.on('close', () => mb.setOption('alwaysOnTop', false))

      return
    }

    event.preventDefault()
    shell.openExternal(url)
  })

  bindMak(mb)
  addContextmenu(mb)
  addTouchbar(mb)

  // mb.app.commandLine.appendSwitch('--enable-experimental-web-platform-features')
})
