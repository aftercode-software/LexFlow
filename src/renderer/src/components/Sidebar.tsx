import { cn } from '@/lib/utils'
import { FileUp, ScanText } from 'lucide-react'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import aftercodeLogo from '../assets/aftercode-logo-white.png'
import { useLocation } from 'react-router'
import { useState } from 'react'

export function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={cn(
          'bg-white border-r transition-all duration-300 flex flex-col',
          isOpen ? 'w-64' : 'w-16'
        )}
      >
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
                <CollapsibleTrigger
                  className={cn(
                    'flex items-center w-full gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-pink-50 hover:text-aftercode',
                    pathname.includes('/escanear') && 'bg-pink-50 text-aftercode font-medium'
                  )}
                >
                  <ScanText size={18} />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left">Escanear boletas</span>
                    </>
                  )}
                </CollapsibleTrigger>
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
                    </>
                  )}
                </CollapsibleTrigger>
              </Collapsible>
            </nav>
          </div>
        </div>
      </aside>
    </div>
  )
}
