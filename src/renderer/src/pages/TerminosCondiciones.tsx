import { Link } from 'react-router'
import bgImg from '../assets/accountant-shortage.jpg'
import aftercodeLogo from '../assets/aftercode-logo-white.png'
import { ChevronLeft } from 'lucide-react'

export default function TerminosCondiciones() {
  console.log('TerminosCondiciones component rendered')
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 max-h-svh overflow-y-auto">
        <header className="flex justify-between items-center">
          <a
            className="flex justify-center items-center gap-2 md:justify-start"
            href="https://aftercode.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex h-10 w-10 items-center bg-aftercode p-2 justify-center rounded-md">
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
          <aside>
            <Link
              to="/"
              className="hover:bg-pink-50 flex font-semibold p-2 rounded-xl items-center hover:text-pink-500 text-left transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 text-pink-500" />
              Volver
            </Link>
          </aside>
        </header>
        <div className="flex flex-1 mt-10 items-center justify-center">
          <div className="w-full">
            <h1 className="scroll-m-20 text-center text-4xl font-bold tracking-tight text-balance">
              Términos y Condiciones de Uso – Legali{' '}
            </h1>

            <p className="leading-7 [&:not(:first-child)]:mt-6">
              <strong>Última actualización:</strong> 7 de julio de 2025
            </p>

            <hr />

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              1. Responsabilidad del Usuario
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Legali es una herramienta de apoyo diseñada para optimizar y automatizar procesos
              relacionados con la gestión y carga de documentos judiciales. Sin embargo,{' '}
              <b className="font-semibold">
                {' '}
                la responsabilidad sobre el contenido que se genera, edita, digitaliza o publica
                mediante esta plataforma recae exclusivamente en el usuario.
              </b>{' '}
              Los usuarios son los únicos responsables de:
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>
                  La veracidad, integridad y legalidad de la información ingresada en el sistema.
                </li>
                <li>La selección del tipo de publicación o trámite judicial correspondiente.</li>
                <li>La documentación adjunta o escaneada, así como la fidelidad de la misma.</li>
                <li>El monitoreo del estado de cada trámite o solicitud iniciada.</li>
                <li>
                  La generación, descarga, presentación o carga de comprobantes de pago cuando
                  corresponda.
                </li>
                <li>
                  El cumplimiento de los requisitos administrativos y legales definidos por el Poder
                  Judicial de Mendoza, la Caja Forense y cualquier otra entidad interviniente.
                </li>
              </ul>
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              2. Limitación de Responsabilidad
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Legali
              <b className="font-semibold">
                {' '}
                no se responsabiliza por errores, omisiones, omisión de plazos, documentos mal
                cargados o trámites judiciales mal gestionados
              </b>{' '}
              por parte del usuario. La plataforma no tiene control ni participación directa en el
              sitio web del Poder Judicial de Mendoza, en el Portal de la Caja Forense ni en sus
              respectivos sistemas de gestión, por lo que{' '}
              <b className="font-semibold">
                cualquier acción realizada por el usuario fuera de Legali escapa totalmente al
                alcance de esta herramienta.
              </b>
              <br />
              <br />
              Asimismo, Legali no garantiza que los archivos escaneados, completados o subidos sean
              aceptados por las plataformas externas ni se hace responsable por posibles rechazos,
              observaciones, demoras o consecuencias legales derivadas del uso incorrecto del
              sistema.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              3. OBJETO
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Al utilizar Legali, el usuario declara conocer y aceptar estos términos, asumiendo
              plena responsabilidad por el uso del sistema. Legali funciona únicamente como un
              asistente técnico-operativo y{' '}
              <b className="font-semibold">
                no reemplaza la revisión profesional, ni exonera al usuario de sus obligaciones como
                operador legal o administrativo.
              </b>
            </p>

            <p className="leading-7 [&:not(:first-child)]:mt-6">
              <em>
                Al usar Legali, el usuario acepta que la plataforma no es responsable por haber
                leído, entendido y aceptado en su totalidad los presentes Términos y Condiciones de
                Uso, obligándose a darles estricto cumplimiento desde el momento en que instale o
                utilice el Software Legali.
              </em>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img src={bgImg} alt="Image" className="absolute inset-0 h-full w-full object-cover " />
      </div>
    </div>
  )
}
