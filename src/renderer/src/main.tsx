import './assets/main.css'

import ReactDOM from 'react-dom/client'
import { Route, Routes, Navigate, HashRouter } from 'react-router'
import Login from './pages/Login'
import { PdfLayout } from './layout/PDFLayout'
import { PoderJudicialProvider } from './context/PoderJudicialContext'
import { Toaster } from 'sonner'
import ScanBoletas from './pages/ScanBoletas'
import SuccessPage from './pages/Success'
import { SignInPoderJudicial } from './pages/SignInPoderJudicial'
import UploadBoletas from './pages/UploadBoletas'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <PoderJudicialProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<PdfLayout />}>
          <Route path="/escanear-pdf" element={<ScanBoletas />} />
          <Route path="/escanear-pdf/:boleta" element={<SuccessPage />} />

          <Route path="/precarga" element={<SignInPoderJudicial />} />
          <Route path="/subir-pdf" element={<UploadBoletas />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
    <Toaster richColors />
  </PoderJudicialProvider>
)
