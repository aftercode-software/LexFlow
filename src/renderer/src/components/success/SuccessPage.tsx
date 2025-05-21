// src/renderer/components/SuccessPage.tsx
import { FileText } from 'lucide-react'
import { useParams, Link } from 'react-router'

export default function SuccessPage() {
  const { boleta } = useParams<{ boleta: string }>()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <FileText className="w-20 h-20 text-emerald-600 mb-4 mx-auto bg-emerald-200 px-4 rounded-full" />
        <h1 className="text-4xl font-bold text-emerald-600 mb-6">¡Éxito!</h1>
        <p className="text-lg text-slate-800 mb-8">
          La boleta <strong>{boleta}</strong> fue escaneada, generada y subida a Sheets
          exitosamente.
        </p>
        <Link
          to="/escanear-pdf"
          className="inline-block px-6 py-3 bg-slate-800 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors"
        >
          Escanear otra boleta
        </Link>
      </div>
    </div>
  )
}
