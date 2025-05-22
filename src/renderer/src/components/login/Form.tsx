import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { cn } from '@renderer/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

export const loginSchema = z.object({
  username: z.string().nonempty('El usuario es obligatorio'),
  password: z
    .string()
    .nonempty('La contraseña es obligatoria')
    .min(4, 'La contraseña debe tener al menos 4 caracteres')
})

export type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async ({ username, password }: LoginFormData) => {
    try {
      await window.api.login(username, password)
      navigate('/escanear-pdf')
    } catch {
      toast.error('Error al iniciar sesión')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Ingresa tu correo y contraseña para continuar
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="user">Usuario</Label>
          <Input id="user" type="text" placeholder="usuario" {...register('username')} />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Validando...' : 'Acceder'}
        </Button>
      </div>

      <div className="text-center text-sm">
        ¿Aún no tienes cuenta?{' '}
        <a href="#" className="underline underline-offset-4">
          Escribinos
        </a>
      </div>
    </form>
  )
}
