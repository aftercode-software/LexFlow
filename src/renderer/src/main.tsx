import './assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import EscanearBoleta from './components/modulo-pdf/ModuloPDF'
import { BrowserRouter, Route, Routes } from 'react-router'
import Login from './pages/Login'
import { PdfLayout } from './layout/PDFLayout'
import { ModuloPrecarga } from './components/precarga/ModuloPrecarga'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: login sin sidebar */}
        <Route path="/" element={<Login />} />

        {/* Rutas con sidebar: anidadas bajo PdfLayout */}
        <Route element={<PdfLayout />}>
          <Route path="/escanear-pdf" element={<EscanearBoleta />} />
          <Route path="/subir-pdf" element={<h2>Página encontrada</h2>} />
          <Route path="/modulo-precarga" element={<ModuloPrecarga />} />
        </Route>

        {/* Opcional: 404 */}
        <Route path="*" element={<h2>Página no encontrada</h2>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
