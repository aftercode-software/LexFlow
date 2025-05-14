import { cn } from '@/lib/utils'
import { FileUp, ScanText } from 'lucide-react'
import { useLocation } from 'react-router'

export function Sidebar() {
  const location = useLocation()
  console.log('location', location)
  const pathname = location.pathname
  console.log('pathname', pathname)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar de navegación */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-aftercode">Aftercode</h1>
          <p className="text-sm text-gray-500">Gestor de boletas</p>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">NAVEGACIÓN</h2>
            <nav className="space-y-1">
              <a
                href="/escanear-pdf"
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-aftercode/5 hover:text-aftercode',
                  true && 'bg-aftercode/5 text-aftercode font-medium'
                )}
              >
                <ScanText size={18} />
                Escanear boletas
              </a>
              <a
                href="/subir-pdf"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-aftercode/5 hover:text-aftercode"
              >
                <FileUp size={18} />
                Subir boletas
              </a>
            </nav>
          </div>

          {/* <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">ACCESO RÁPIDO</h2>
            <nav className="space-y-1">
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-aftercode/5 hover:text-aftercode"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                Favoritos
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-aftercode/5 hover:text-aftercode"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Recientes
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-aftercode/5 hover:text-aftercode"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                Papelera
              </a>
            </nav>
          </div> */}
        </div>

        {/* <div className="mt-auto pt-6 border-t">
          <nav className="space-y-1">
            <a
              href="/modulo-pdf"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-aftercode/5 hover:text-aftercode',
                pathname === '/modulo-pdf' && 'bg-aftercode/5 text-aftercode font-medium'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
              Módulo PDF
            </a>
            <a
              href="/subir-pdf"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-aftercode/5 hover:text-aftercode',
                pathname === '/subir-pdf' && 'bg-aftercode/5 text-aftercode font-medium'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Subir PDF
            </a>
          </nav>
        </div> */}
      </aside>
    </div>
  )
}
