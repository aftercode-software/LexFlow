import { LoginForm } from '@renderer/components/login/Form'
import bgImg from '../assets/accountant-shortage.jpg'
import aftercodeLogo from '../assets/aftercode-logo-white.png'

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="https://aftercode.dev"
            className="flex items-center gap-2 font-medium"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex h-8 w-8 items-center bg-aftercode p-1 justify-center rounded-md text-gray-800">
              <img src={aftercodeLogo} alt="" />
            </div>
            Aftercode
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img src={bgImg} alt="Image" className="absolute inset-0 h-full w-full object-cover " />
      </div>
    </div>
  )
}
