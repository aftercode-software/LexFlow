import { Button } from '@/components/ui/button'
import { useAuth } from '@renderer/context/PoderJudicialContext'
import { LogOut } from 'lucide-react'

export function UserHeader() {
  const { userData, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated || !userData) {
    return null
  }

  return (
    <div className="bg-white border-b border-slate-200 py-4 px-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-slate-800">{userData.recaudador}</h2>
          <div className="flex text-xs text-slate-500 mt-0.5 gap-x-4">
            <div>{userData.matricula}</div>
            <div>{userData.organismo}</div>
            <div>{userData.correo}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          size="sm"
          className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
