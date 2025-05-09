import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ModuloPDF from './components/modulo-pdf/ModuloPDF'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <App /> */}
    <ModuloPDF />
  </React.StrictMode>
)
