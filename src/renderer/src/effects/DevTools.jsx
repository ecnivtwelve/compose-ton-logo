function DevTools() {
  const toggleFullscreen = () => {
    window.electron.ipcRenderer.send('toggle-fullscreen')
  }

  const handleDebug = () => {
    window.electron.ipcRenderer.send('open-devtools')
  }

  const handleQuit = () => {
    window.electron.ipcRenderer.send('quit-app')
  }

  return (
    <>
      <style>
        {`
        .dev-tools {
          position: fixed;
          top: 0px;
          right: 0px;
          color: white;
          padding: 10px;
          border-radius: 0px;
          z-index: 100000;
        }

        .dev-tools button {
          background: none;
          color: white;
          border: 1px solid white;
          padding: 8px 12px;
          margin: 0 5px;
          border-radius: 0px;
          cursor: pointer;
          filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 1)) drop-shadow(0px 0px 1px rgba(0, 0, 0, 1));
          font-size: 14px;
          letter-spacing: 0.2px;
        }
      `}
      </style>

      <div className="dev-tools">
        <button onClick={toggleFullscreen}>
          Toggle fullscreen
        </button>
        <button onClick={handleDebug}>
          Debug
        </button>
        <button onClick={handleQuit}>
          Quitter
        </button>
      </div>
    </>
  )
}

export default DevTools