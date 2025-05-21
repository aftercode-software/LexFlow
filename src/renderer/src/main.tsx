import './assets/main.css'
import ReactDOM from 'react-dom/client'
import EscanearBoleta from './components/modulo-pdf/ModuloPDF'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router'
import Login from './pages/Login'
import { PdfLayout } from './layout/PDFLayout'
import { PoderJudicialProvider } from './context/PoderJudicialContext'
import { LoginJudicial } from './components/precarga/LoginJudicial'

import SuccessPage from './components/success/SuccessPage'
import BoletasTable from './components/subida/SubirBoletas'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <PoderJudicialProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<PdfLayout />}>
          <Route path="/escanear-pdf" element={<EscanearBoleta />} />
          <Route path="/escanear-pdf/:boleta" element={<SuccessPage />} />

          <Route path="/precarga" element={<LoginJudicial />} />
          <Route path="/subir-pdf" element={<BoletasTable />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </PoderJudicialProvider>
)
