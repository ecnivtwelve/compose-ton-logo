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

  const handleReset = () => {
    window.electron.ipcRenderer.send('relaunch-app')
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
          padding: 6px;
          border-radius: 0px;
          z-index: 100000;
          opacity: 0.5;
        }

        .dev-tools button {
          background: none;
          color: white;
          border: 1px solid white;
          padding: 5px 8px;
          margin: 0 3px;
          border-radius: 0px;
          cursor: pointer;
          filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 1)) drop-shadow(0px 0px 1px rgba(0, 0, 0, 1));
          font-size: 10px;
          letter-spacing: 0.2px;
        }
      `}
      </style>

      <div className="dev-tools">
        <button onClick={toggleFullscreen}>Toggle fullscreen</button>
        <button onClick={handleDebug}>Debug</button>
        <button onClick={handleReset}>Reset App</button>
        <button onClick={handleQuit}>Quitter</button>
      </div>
    </>
  )
}

export default DevTools
