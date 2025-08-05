import './assets/main.css'

import ReactDOM from 'react-dom/client'
import { Route, Routes, Navigate, HashRouter } from 'react-router'
import Login from './pages/Login'
import { PdfLayout } from './layout/PDFLayout'
import { PoderJudicialProvider } from './context/PoderJudicialContext'
import { Toaster } from 'sonner'
import ScanBoletas from './pages/ScanBoletas'
import { SignInPoderJudicial } from './pages/SignInPoderJudicial'
import UploadBoletas from './pages/UploadBoletas'
import RecaudadoresPage from './pages/Recaudadores'
import DemandadosPage from './pages/Demandados'
import TerminosCondiciones from './pages/TerminosCondiciones'
import ScanCedulas from './pages/ScanCSM'
import Dashboard from './pages/Dashboard'
import UploadCedulas from './pages/UploadCedulas'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <PoderJudicialProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />

        <Route element={<PdfLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/escanear-pdf" element={<ScanBoletas />} />
          <Route path="/csm" element={<ScanCedulas />} />
          <Route path="/lotes" element={<UploadCedulas />} />

          <Route path="/demandados" element={<DemandadosPage />} />
          <Route path="/recaudadores" element={<RecaudadoresPage />} />

          <Route path="/precarga" element={<SignInPoderJudicial />} />
          <Route path="/subir-pdf" element={<UploadBoletas />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
    <Toaster richColors />
  </PoderJudicialProvider>
)
