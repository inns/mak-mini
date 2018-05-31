const execJS = (menubar, ...args) => menubar.window.webContents.executeJavaScript(...args)

// Emit events to Mak
module.exports = function emit(menubar, type, data) {
  switch (type) {
    case 'CMDSubject':
      execJS(menubar, `
        ;global.Mak.CMDSubject.next({
          type: 'set',
          data: ${JSON.stringify(data)},
        });
      `)
      break
  }
}
