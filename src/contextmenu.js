const platform = require('os').platform()
const { Menu, shell, clipboard, dialog } = require('electron')

const { IS_DEV } = require('./env')
const VERSION = require('../package.json').version
const { URL_MAK, URL_MAK_GITHUB, URL_GIST } = require('./config')

module.exports = function addContextmenu (menubar) {
  const openExternal = URL => shell.openExternal(URL)
  const execJS = (...args) => menubar.window.webContents.executeJavaScript(...args)

  const shortCuts = [
    {
      label: 'Mak',
      submenu: [
        { label: 'Quit', accelerator: 'Command+Q', click: () => menubar.app.quit() },
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
  
  let gistId = null
  let template = [
  {
    label: 'Open Mak in Browser',
    click: () => openExternal(URL_MAK)
  },
  { type: 'separator' },
  {
    label: 'Home',
    click: () => {
      execJS(`;window.location = '${URL_MAK}';`)
      menubar.showWindow()
    }
  },
  {
    label: 'List',
    click: () => {
      execJS(`;window.location = '${URL_MAK}#list';`)
      menubar.showWindow()
    }
  },
  {
    label: 'Preferences',
    click: () => {
      execJS(`;window.location = '${URL_MAK}#preferences';`)
      menubar.showWindow()
    }
  },
  { type: 'separator' },
  {
    label: `About Mak v${VERSION}`,
    click: () => openExternal(URL_MAK_GITHUB)
  },
  { type: 'separator' },
  {
    label: `Open a Gist...`,
    click: () => {
      if (!gistId) {
        dialog.showMessageBox({
          type: 'info',
          message: 'Please copy a Gist URL to open.',
          buttons: ['OK', 'Browse Gists...'],
          cancelId: 0,
        }, res => {
          if (res === 1) {
            openExternal(URL_GIST)
          }
        })
      } else {
        execJS(`;window.location = '${URL_MAK}#?gist=${gistId}';`)
        menubar.showWindow()
      }
    }
  },
  ...(IS_DEV
    ? [
        { type: 'separator' },
        {
          label: '*Dev ' + platform
        },
        {
          label: '*Inspect',
          click: () => menubar.window.openDevTools()
        },
        { type: 'separator' }
      ]
    : [{ type: 'separator' }]),
    { label: 'Quit', role: 'quit' }
  ]

  menubar.tray.on('right-click', function() {
    let str = (clipboard.readText() || '').trim()
    if (str.startsWith(URL_GIST) || /^[a-z0-9]+$/.test(str)) {
      // a gist
      gistId = str.split('/').filter(s => s).pop()

      let displayGistId = gistId.length <= 15 ? gistId : (gistId.slice(0, 15) + '...')
      template[8].label = `Open ${displayGistId}`
    } else {
      gistId = null
      template[8].label = 'Open a Gist...'
    }
    const contextMenu = Menu.buildFromTemplate(template)
  
    Menu.setApplicationMenu(contextMenu)
    menubar.tray.popUpContextMenu(contextMenu)
  })
  Menu.setApplicationMenu(Menu.buildFromTemplate(shortCuts))
}
