import { LoginForm } from '@renderer/components/login/Form'
import bgImg from '../assets/accountant-shortage.jpg'
import aftercodeLogo from '../assets/aftercode-logo-white.png'

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 ">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <header className="flex justify-between items-center">
          <a
            className="flex justify-center items-center gap-2 md:justify-start"
            href="https://aftercode.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex h-10 w-10 items-center bg-lex p-2 justify-center rounded-md">
              <img src={aftercodeLogo} alt="" />
            </div>
            <aside>
              <p className="font-semibold text-black">Legali</p>
              <p className="text-sm text-zinc-600">
                producto de{' '}
                <b className="font-medium hover:text-aftercode transition-colors duration-200">
                  AfterCode
                </b>
              </p>
            </aside>
          </a>
          <aside className="flex items-center gap-2 text-sm text-zinc-600">
            <p className="font-sans text-base">v. 1.1.0</p>
          </aside>
        </header>
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
