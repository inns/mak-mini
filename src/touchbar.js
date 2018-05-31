const path = require('path')
const { TouchBar } = require('electron')

const emit = require('./cmd')
const { on, status } = require('./status')

const { URL_MAK } = require('./config')

const {
  TouchBarLabel,
  TouchBarButton,
  TouchBarSpacer,
  TouchBarGroup
} = TouchBar

module.exports = function addTouchbar (menubar) {
  const execJS = (...args) => menubar.window.webContents.executeJavaScript(...args)
  const DARK_ICON = path.join(__dirname, '..', 'assets', `moon@4x.png`)
  const LIGHT_ICON = path.join(__dirname, '..', 'assets', `sun@4x.png`)
  const FS_ICON = path.join(__dirname, '..', 'assets', `font@4x.png`)
  const NU_ICON = path.join(__dirname, '..', 'assets', `list-numbers@4x.png`)

  let currentSettings = {}

  const homeBtn = new TouchBarButton({
    label: '#',
    click: () => execJS(`;window.location = '${URL_MAK}#';`)
  })
  
  const listBtn = new TouchBarButton({
    label: '#list',
    click: () => execJS(`;window.location = '${URL_MAK}#list';`)
  })
  
  const preferencesBtn = new TouchBarButton({
    label: '#preferences',
    click: () => execJS(`;window.location = '${URL_MAK}#preferences';`)
  })
  
  const fontsizeBtn = new TouchBarButton({
    icon: FS_ICON,
    backgroundColor: '#000',
    click: () =>
      emit(menubar, 'CMDSubject', {
        name: 'fs',
        arg: currentSettings.fs === 'normal' ? 'large' : (currentSettings.fs === 'large' ? 'small' : 'normal')
      })
  })

  const linenumberBtn = new TouchBarButton({
    icon: NU_ICON,
    backgroundColor: '#000',
    click: () =>
      emit(menubar, 'CMDSubject', {
        name: currentSettings.nu ? 'nonum' : 'num'
      })
  })

  const themeBtn = new TouchBarButton({
    icon: DARK_ICON,
    backgroundColor: '#000',
    click: () =>
      emit(menubar, 'CMDSubject', {
        name: 'theme',
        arg: currentSettings.theme === 'light' ? 'dark' : 'light'
      })
  })
  
  const makBtn = new TouchBarButton({
    label: 'Mak',
    backgroundColor: '#000'
  })
  
  const titleBtn = new TouchBarButton({
    label: '#',
    backgroundColor: '#000'
  })
  
  const touchBar = new TouchBar({
    items: [
      titleBtn,
      new TouchBarSpacer({ size: 'flexible' }),
      themeBtn,
      linenumberBtn,
      fontsizeBtn,
      new TouchBarGroup({
        items: [homeBtn, listBtn, preferencesBtn]
      })
    ],
    escapeItem: makBtn
  })

  const updateTouchbar = (type, data) => {
    if (type === 'settings') {
      themeBtn.icon = data.theme === 'light' ? DARK_ICON : LIGHT_ICON
      currentSettings = data
    } else if (type === 'title') {
      let originalTitle = '#' + data.toLowerCase()
      titleBtn.label = originalTitle.length <= 15 ? originalTitle : (originalTitle.slice(0, 15) + '...')
    }
  }

  on('initSettings', status => {
    updateTouchbar('settings', status.initSettings)
  })
  on('afterLoadSettings', status => {
    updateTouchbar('settings', status.afterLoadSettings)
  })
  on('title', status => {
    updateTouchbar('title', status.title)
  })
  menubar.window.setTouchBar(touchBar)  
}
