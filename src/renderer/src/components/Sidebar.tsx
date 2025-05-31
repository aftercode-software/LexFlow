import { cn } from '@/lib/utils'
import { CircleUser, FileUp, LogIn, LogOut, ScanText, Users } from 'lucide-react'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router'
import { useState } from 'react'
import { useAuth } from '@renderer/context/PoderJudicialContext'
import aftercodeLogo from '../assets/aftercode-logo-white.png'

const ICON_SIZE = 19

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
          isOpen ? 'w-64' : 'w-24'
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-aftercode text-white">
              <img src={aftercodeLogo} alt="Aftercode Logo" className="size-5" />
            </div>
            {isOpen && (
              <div>
                <h1 className="text-xl font-bold text-black">Aftercode</h1>
                <p className="text-xs text-gray-500">Gestor de boletas</p>
              </div>
            )}
          </div>
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
              className={cn('transition-transform', isOpen ? 'rotate-0' : 'rotate-180')}
            >
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
        </div>

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
              <div className="flex items-center justify-between px-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-800">
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
              <span className={cn(!isOpen && 'sr-only')}>BOLETAS</span>
            </div>

            <nav className="space-y-2">
              <Collapsible defaultOpen>
                <Link to="/escanear-pdf">
                  <CollapsibleTrigger
                    className={cn(
                      'flex justify-center items-center w-full gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-pink-50 hover:text-aftercode',
                      pathname.includes('/escanear-pdf') && 'bg-pink-50 text-aftercode font-medium'
                    )}
                  >
                    <ScanText size={ICON_SIZE} />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">Escanear boletas</span>
                      </>
                    )}
                  </CollapsibleTrigger>
                </Link>
              </Collapsible>
            </nav>
          </div>
          <div className="px-3 mb-4">
            <div
              className={cn(
                'flex items-center text-sm font-medium text-gray-500 mb-2',
                isOpen ? 'justify-between' : 'justify-center'
              )}
            >
              <span className={cn(!isOpen && 'sr-only')}>RECURSOS</span>
            </div>

            <nav className="space-y-2">
              <Collapsible defaultOpen>
                <Link to="/demandados">
                  <CollapsibleTrigger
                    className={cn(
                      'flex justify-center items-center w-full gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-pink-50 hover:text-aftercode',
                      pathname.includes('/demandados') && 'bg-pink-50 text-aftercode font-medium'
                    )}
                  >
                    <Users size={ICON_SIZE} />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">Demandados</span>
                      </>
                    )}
                  </CollapsibleTrigger>
                </Link>
              </Collapsible>

              <Collapsible defaultOpen>
                <Link to="/recaudadores">
                  <CollapsibleTrigger
                    className={cn(
                      'flex justify-center items-center w-full gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-pink-50 hover:text-aftercode',
                      pathname.includes('/recaudadores') && 'bg-pink-50 text-aftercode font-medium'
                    )}
                  >
                    <CircleUser size={ICON_SIZE} />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">Recaudadores</span>
                      </>
                    )}
                  </CollapsibleTrigger>
                </Link>
              </Collapsible>
            </nav>
          </div>
          <div className="px-3 mb-4">
            <div
              className={cn(
                'flex items-center text-sm font-medium text-gray-500 mb-2',
                isOpen ? 'justify-between' : 'justify-center'
              )}
            >
              <span className={cn(!isOpen && 'sr-only')}>PODER JUDICIAL</span>
            </div>

            <nav className="space-y-2">
              <Collapsible defaultOpen>
                <Link to="/precarga">
                  <CollapsibleTrigger
                    className={cn(
                      'flex justify-center items-center w-full gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-pink-50 hover:text-aftercode',
                      pathname.includes('/precarga') && 'bg-pink-50 text-aftercode font-medium'
                    )}
                  >
                    <LogIn size={ICON_SIZE} />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">Iniciar sesión</span>
                      </>
                    )}
                  </CollapsibleTrigger>
                </Link>
              </Collapsible>
              <Collapsible defaultOpen disabled={!isAuthenticated}>
                <Link to="/subir-pdf" aria-disabled={!isAuthenticated}>
                  <CollapsibleTrigger
                    className={cn(
                      'flex justify-center items-center w-full gap-2 px-3 py-2 rounded-md rounded-md',
                      isAuthenticated
                        ? 'text-gray-700 hover:bg-pink-50 hover:text-aftercode'
                        : 'text-gray-400 cursor-not-allowed hover:bg-gray-100 hover:text-gray-400',
                      pathname.includes('/subir-pdf') &&
                        isAuthenticated &&
                        'bg-pink-50 text-aftercode font-medium'
                    )}
                    disabled={!isAuthenticated}
                  >
                    <FileUp size={ICON_SIZE} />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">Subir boletas</span>
                      </>
                    )}
                  </CollapsibleTrigger>
                </Link>
              </Collapsible>
            </nav>
          </div>
        </div>
      </aside>
    </div>
  )
}
