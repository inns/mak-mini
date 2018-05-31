const status = {}
const listeners = {}

function bindMak(menubar) {
  const execJS = (...args) => menubar.window.webContents.executeJavaScript(...args)

  const registerEditorEv = (name) => {
    // Trick:
    // subscribe the stream only once since we can not use callback 
    // but only Promise here in Electron.
    execJS(`new Promise(res => 
      window.Mak.EditorSubject
        .filter(ev => ev.type === '${name}')
        .first()
        .subscribe(res)
    )`)
    .then((res) => {
      // Callbacks
      status[name] = res.data
      listeners[name] && listeners[name].forEach(fn => fn(status))
      // Register again
      registerEditorEv(name)
    })
  }
  
  // Init values after Mak instance loaded
  execJS('window.Mak.mak && window.Mak.mak.getSettings()', settings => {
    status.initSettings = settings
    listeners.initSettings && listeners.initSettings.forEach(fn => fn(status))
  })

  // Bind events
  registerEditorEv('afterLoadSettings')
  registerEditorEv('title')
}

function on(type, fn) {
  listeners[type] = [...(listeners[type] || []), fn]
}

module.exports = {
  status,
  on,
  bindMak
}
