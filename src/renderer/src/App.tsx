import { Button } from './components/ui/button'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <div className="text-black w-screen h-screen">
      <p className="text-6xl bg-blue-500 p-12">Hello Tailwind!</p>
      <Button onClick={() => ipcHandle()}>
        <span className="text-2xl">Click me!</span>
      </Button>
    </div>
  )
}

export default App
