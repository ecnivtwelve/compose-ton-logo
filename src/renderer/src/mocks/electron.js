// Mock implementation of Electron APIs for the web version

if (!window.electron) {
  window.electron = {
    ipcRenderer: {
      send: (channel, data) => {
        console.log(`[Web Mock] ipcRenderer.send('${channel}'):`, data)
        if (channel === 'send-logo') {
          console.log('Logo sent (mock)!')
        }
        if (channel === 'quit-app') {
          console.log('App quit (mock)!')
          alert("L'application a quitté (simulation web).")
        }
      },
      on: (channel) => {
        console.log(`[Web Mock] ipcRenderer.on('${channel}') attached`)
      },
      invoke: async (channel, data) => {
        console.log(`[Web Mock] ipcRenderer.invoke('${channel}'):`, data)
        return null
      }
    }
  }
}

if (!window.api) {
  window.api = {
    getAppConfig: async () => {
      console.log('[Web Mock] getAppConfig called')
      return {
        isDev: true, // or false depending on what we want to simulate
        isAdmin: false,
        platform: 'web'
      }
    }
  }
}
