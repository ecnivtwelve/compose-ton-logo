import logo from '../assets/img/logo.png'

function LayersEditor() {
  return (
    <>
      <div className="panel w-256 h-[calc(100% - 34px)] mt-[34px] flex flex-col items-center">
        <img src={logo} alt="" className="mt-[-50px] h-22 ts" />
      </div>
    </>
  )
}

export default LayersEditor
