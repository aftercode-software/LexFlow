import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useParams, Link } from 'react-router'

export default function SuccessPage() {
  const { boleta, type } = useParams<{ boleta: string; type: string }>()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg border mt-40 border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-3">¡Procesamiento exitoso!</h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {type === 'boleta' ? (
              <>
                La boleta <span className="font-medium text-gray-900">{boleta}</span> fue escaneada,
                procesada y subida a Google Sheets correctamente.
              </>
            ) : (
              <>
                La cédula <span className="font-medium text-gray-900">{boleta}</span> (número de
                CUIJ) fue escaneada, procesada y subida a Google Sheets correctamente.
              </>
            )}
          </p>

          <Link
            to="/escanear-pdf"
            className="inline-flex items-center gap-2 px-6 py-3 bg-lex/80 text-white font-medium rounded-lg hover:bg-lex transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Escanear otra boleta
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Los datos han sido guardados automáticamente en tu hoja de cálculo
          </p>
        </div>
      </div>
    </div>
  )
}
