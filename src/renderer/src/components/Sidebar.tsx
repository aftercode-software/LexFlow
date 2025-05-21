import { cn } from '@/lib/utils'
import { ChevronDown, FileUp, LogOut, ScanText } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router'
import { useState } from 'react'
import { useAuth } from '@renderer/context/PoderJudicialContext'
import aftercodeLogo from '../assets/aftercode-logo-white.png'

export function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const [isOpen, setIsOpen] = useState(true)
  const { userData, logout, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={cn(
          'bg-white border-r transition-all duration-300 flex flex-col',
          isOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo section */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-aftercode text-white">
              <img src={aftercodeLogo} alt="Aftercode Logo" className="size-5" />
            </div>
            {isOpen && (
              <div>
                <h1 className="text-xl font-bold text-aftercode">Aftercode</h1>
                <p className="text-xs text-gray-500">Gestor de boletas</p>
              </div>
            )}
          </div>
        </div>

        {/* User header section - always visible if authenticated */}
        {isAuthenticated && userData && (
          <div className={cn('border-b py-2 px-3', !isOpen && 'px-2')}>
            {isOpen ? (
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-slate-800 text-sm truncate">
                    {userData.recaudador}
                  </h2>
                  <div className="flex flex-col text-xs text-slate-500 mt-0.5">
                    <div className="truncate">
                      {userData.matricula} · {userData.organismo}
                    </div>
                    <div className="truncate">{userData.correo}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={logout}
                  size="sm"
                  className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-7 w-7 p-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-800">
                  {userData.recaudador.charAt(0)}
                </div>
                <Button
                  variant="ghost"
                  onClick={logout}
                  size="sm"
                  className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-6 w-6 p-0 mt-1"
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Navigation section */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-4">
            <div
              className={cn(
                'flex items-center text-sm font-medium text-gray-500 mb-2',
                isOpen ? 'justify-between' : 'justify-center'
              )}
            >
              <span className={cn(!isOpen && 'sr-only')}>NAVEGACIÓN</span>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-md hover:bg-gray-100"
                aria-label={isOpen ? 'Colapsar sidebar' : 'Expandir sidebar'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn('transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}
                >
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
            </div>

            <nav className="space-y-1">
              <Collapsible defaultOpen>
                <Link to="/escanear-pdf">
                  <CollapsibleTrigger
                    className={cn(
                      'flex items-center w-full gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-pink-50 hover:text-aftercode',
                      pathname.includes('/escanear-pdf') && 'bg-pink-50 text-aftercode font-medium'
                    )}
                  >
                    <ScanText size={18} />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">Escanear boletas</span>
                      </>
                    )}
                  </CollapsibleTrigger>
                </Link>
              </Collapsible>

              <Collapsible defaultOpen>
                <CollapsibleTrigger
                  className={cn(
                    'flex items-center w-full gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-pink-50 hover:text-aftercode',
                    pathname.includes('/subir') && 'bg-pink-50 text-aftercode font-medium'
                  )}
                >
                  <FileUp size={18} />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left">Escanear boletas</span>
                      <ChevronDown className="h-4 w-4 transition-transform ui-open:rotate-180" />
                    </>
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className={cn(isOpen ? 'pl-9' : 'hidden')}>
                  <div className="space-y-1 pt-1">
                    <Link
                      to="/precarga"
                      className={cn(
                        'block py-1.5 px-3 text-sm rounded-md text-gray-700 hover:bg-pink-50 hover:text-aftercode',
                        pathname === '/precarga"' && 'bg-pink-50 text-aftercode font-medium'
                      )}
                    >
                      Inicio de sesión
                    </Link>
                    <Link
                      to="/subir-pdf"
                      className={cn(
                        'block py-1.5 px-3 text-sm rounded-md text-gray-700 hover:bg-pink-50 hover:text-aftercode',
                        pathname === '/subir-pdf' && 'bg-pink-50 text-aftercode font-medium'
                      )}
                    >
                      Subir boletas
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </nav>
          </div>
        </div>
      </aside>
    </div>
  )
}
