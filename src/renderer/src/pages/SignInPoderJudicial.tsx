import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { LogIn } from 'lucide-react'
import { useAuth } from '@renderer/context/PoderJudicialContext'

export function SignInPoderJudicial() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    setIsLoading(true)
    const data = await window.api.iniciarLoginManual()
    login(data)
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center p-6 min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Poder Judicial</CardTitle>
          <CardDescription>
            Inicie sesión en su cuenta del poder judicial para la carga de boletas y documentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            size="lg"
            className="w-full max-w-xs hover:bg-lex"
          >
            <LogIn className="mr-2 h-5 w-5" />
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          Debe iniciar sesión con el recaudador que va a realizar la carga de documentos.
        </CardFooter>
      </Card>
    </div>
  )
}
