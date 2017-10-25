const path = require('path')
const platform = require('os').platform()

const menubar = require('menubar')

const env = process.env.NODE_ENV
const isDev = env && env.trim() === 'development'

const { Menu, shell, TouchBar } = require('electron')
const {
  TouchBarLabel,
  TouchBarButton,
  TouchBarSpacer,
  TouchBarGroup
} = TouchBar

const INDEX = 'https://mak.ink'
const WIDTH = 400
const HEIGHT = 600
const VERSION = require('./package.json').version

const openExternal = URI => shell.openExternal(URI)
const execJS = (...args) =>
  mb.window && mb.window.webContents.executeJavaScript(...args)

var mb = menubar({
  icon: path.join(__dirname, 'assets', `${platform}-IconTemplate.png`),
  index: INDEX,
  preloadWindow: true,
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: 'white'
})

const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Mak in Browser',
    click: () => openExternal('https://mak.ink')
  },
  { type: 'separator' },
  {
    label: 'Home',
    click: () => {
      execJS(`;window.location = '${INDEX}';`)
      mb.showWindow()
    }
  },
  {
    label: 'List',
    click: () => {
      execJS(`;window.location = '${INDEX}#list';`)
      mb.showWindow()
    }
  },
  {
    label: 'Preferences',
    click: () => {
      execJS(`;window.location = '${INDEX}#preferences';`)
      mb.showWindow()
    }
  },
  { type: 'separator' },
  {
    label: `About Mak v${VERSION}`,
    click: () => openExternal('https://github.com/inns/mak')
  },
  ...(isDev
    ? [
        { type: 'separator' },
        {
          label: 'Development ' + platform
        },
        {
          label: 'Inspect',
          click: () => mb.window.openDevTools()
        },
        { type: 'separator' }
      ]
    : [{ type: 'separator' }]),
  { label: 'Quit', role: 'quit' }
])

const homeBtn = new TouchBarButton({
  label: '#',
  click: () => execJS(`;window.location = '${INDEX}#';`)
})

const listBtn = new TouchBarButton({
  label: '#list',
  click: () => execJS(`;window.location = '${INDEX}#list';`)
})

const preferencesBtn = new TouchBarButton({
  label: '#preferences',
  click: () => execJS(`;window.location = '${INDEX}#preferences';`)
})

const themeBtn = new TouchBarButton({
  label: '🌖',
  backgroundColor: '#000',
  click: () =>
    execJS(`
    ;window[window.settings.theme === 'light' ? 'dark' : 'light']();
  `)
})

const cntBtn = new TouchBarButton({
  label: '✍️',
  backgroundColor: '#000',
  click: () => execJS(`;window[window.settings.cnt ? 'nocnt' : 'cnt']();`)
})

const titleBtn = new TouchBarButton({
  label: 'Mak',
  backgroundColor: '#000',
  click: () => execJS(`;window[window.settings.cnt ? 'nocnt' : 'cnt']();`)
})

const touchBar = new TouchBar({
  items: [
    new TouchBarSpacer({ size: 'small' }),
    new TouchBarGroup({
      items: [homeBtn, listBtn, preferencesBtn]
    }),
    new TouchBarSpacer({ size: 'small' }),
    themeBtn,
    cntBtn,
    new TouchBarSpacer({ size: 'small' })
  ],
  escapeItem: titleBtn
})

const tick = () => {
  if (mb.window) {
    mb.window.webContents.executeJavaScript(
      'window.document.title',
      false,
      title => {
        titleBtn.label = title
      }
    )
  }
}

const shortCuts = [
  {
    label: 'Mak',
    submenu: [
      { label: 'Quit', accelerator: 'Command+Q', click: () => mb.app.quit() },
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:'
      }
    ]
  }
]

mb.on('ready', function() {
  mb.window.setSkipTaskbar(true)

  mb.window.webContents.on('did-finish-load', function() {
    mb.window.webContents.executeJavaScript(';window.IS_MAK_MINI = true;')
    setInterval(tick, 500)
  })

  mb.window.webContents.on('will-navigate', function(event, url) {
    if (!url.startsWith(INDEX)) {
      // external links
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  mb.tray.on('right-click', function() {
    mb.tray.popUpContextMenu(contextMenu)
  })

  mb.window.setTouchBar(touchBar)

  Menu.setApplicationMenu(Menu.buildFromTemplate(shortCuts))
  // mb.app.commandLine.appendSwitch('--enable-experimental-web-platform-features')
})
