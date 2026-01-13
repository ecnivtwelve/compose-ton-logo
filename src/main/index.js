import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('open-devtools', (event) => {
    event.sender.openDevTools()
  })

  ipcMain.on('toggle-fullscreen', (event) => {
    const win = event.sender.getOwnerBrowserWindow()
    if (win) {
      win.setFullScreen(!win.isFullScreen())
    }
  })

  ipcMain.on('quit-app', () => {
    app.quit()
  })

  createWindow()
  createSecondWindow()

  ipcMain.on('message-from-second', (event, arg) => {
    console.log(arg)
    // Optionally forward to main window
    const otherWindow = BrowserWindow.getAllWindows().find((w) => w.webContents !== event.sender)
    if (otherWindow) {
      otherWindow.webContents.send('message', `Other window says: ${arg}`)
    }
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      createSecondWindow()
    }
  })
})

function createSecondWindow() {
  const displays = screen.getAllDisplays()
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })

  const secondWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    x: externalDisplay ? externalDisplay.bounds.x : undefined,
    y: externalDisplay ? externalDisplay.bounds.y : undefined,
    fullscreen: !!externalDisplay,
    fullscreenable: true,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  secondWindow.on('ready-to-show', () => {
    secondWindow.show()
  })

  secondWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    secondWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/second.html`)
  } else {
    secondWindow.loadFile(join(__dirname, '../renderer/second.html'))
  }
}

ipcMain.on('send-logo', (event, logoData) => {
  console.log('Main process received send-logo event')
  const windows = BrowserWindow.getAllWindows()
  console.log(`Found ${windows.length} windows`)
  windows.forEach((win) => {
    if (win.webContents.id !== event.sender.id) {
      console.log(`Sending display-logo to window with ID: ${win.id}`)
      win.webContents.send('display-logo', logoData)
    } else {
      console.log(`Skipping sender window ID: ${win.id}`)
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
