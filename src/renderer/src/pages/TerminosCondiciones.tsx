import { Link } from 'react-router'
import bgImg from '../assets/accountant-shortage.jpg'
import aftercodeLogo from '../assets/aftercode-logo-white.png'
import { ChevronLeft } from 'lucide-react'

export default function TerminosCondiciones() {
  console.log('TerminosCondiciones component rendered')
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 max-h-svh overflow-y-auto">
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
        <Link
          to="/"
          className="hover:bg-pink-50 flex font-semibold mt-4 items-center hover:text-pink-500 text-left"
        >
          <ChevronLeft className="w-4 h-4 text-pink-500" />
          Volver
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
              TÉRMINOS Y CONDICIONES DE USO DEL SOFTWARE “AUTOMAT BOLETAS”
            </h1>

            <p className="leading-7 [&:not(:first-child)]:mt-6">
              <strong>Fecha de última actualización:</strong> 2 de junio de 2025
            </p>

            <hr />

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              1. ACEPTACIÓN DE LOS TÉRMINOS
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Al descargar, instalar, copiar, ejecutar o, de cualquier otra forma, utilizar el
              software denominado “Automat Boletas” (en adelante, el “Software”), usted (en
              adelante, el “Usuario”) acepta quedar vinculado por estos Términos y Condiciones de
              Uso (en adelante, los “Términos y Condiciones”) y por la Política de Privacidad
              asociada. Si el Usuario no está de acuerdo, en todo o en parte, con cualquiera de las
              disposiciones aquí establecidas, deberá abstenerse de utilizar el Software de forma
              inmediata.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              2. DEFINICIONES
            </h2>
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
              <li>
                <strong>Proveedor/Desarrollador:</strong> Aftercode Software (o la persona jurídica
                que corresponda), en calidad de titular de los derechos de propiedad intelectual
                sobre el Software.
              </li>
              <li>
                <strong>Software:</strong> Aplicación informática desarrollada para automatizar el
                proceso de carga y gestión de boletas en el sitio web del Poder Judicial de Mendoza.
              </li>
              <li>
                <strong>Usuario Final:</strong> Persona física o jurídica que utilice el Software
                para el fin previsto, a título gratuito o mediante licencia comercial.
              </li>
              <li>
                <strong>Plataforma Objetivo:</strong> Sitio web oficial del Poder Judicial de
                Mendoza (https://www.justiciamendoza.gov.ar o equivalente), donde se suben y
                consultan boletas de recaudación.
              </li>
            </ul>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              3. OBJETO
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              3.1. El presente documento establece los derechos y obligaciones tanto del
              Proveedor/Desarrollador como del Usuario Final en relación con la instalación, uso y
              explotación del Software.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              3.2. El Software tiene por objeto permitir a los recaudadores y usuarios autorizados
              optimizar las tareas de escaneo, generación y envío de boletas de pago al Poder
              Judicial de Mendoza.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              4. ALCANCE DE LA LICENCIA
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              4.1. El Proveedor concede al Usuario una licencia de uso no exclusiva, intransferible
              y revocable, para instalar y ejecutar el Software en dispositivos propios,
              exclusivamente con el fin y en los términos establecidos en estos Términos y
              Condiciones.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              4.2. Está expresamente prohibido:
            </p>
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
              <li>
                Redistribuir, sublicenciar, rentar, arrendar, prestar o transferir de cualquier modo
                el Software a terceros sin previa autorización escrita del Proveedor.
              </li>
              <li>
                Realizar ingeniería inversa, descompilar, desensamblar o aplicar cualquier
                procedimiento que permita obtener el código fuente del Software.
              </li>
              <li>
                Modificar, adaptar, traducir o crear obras derivadas basadas en el Software, salvo
                autorización expresa del Proveedor.
              </li>
              <li>
                Utilizar el Software para actividades fraudulentas, delictivas o contrarias a la
                normativa vigente en Argentina.
              </li>
            </ul>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              5. OBLIGACIONES DEL USUARIO
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">5.1. El Usuario se compromete a:</p>
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
              <li>
                Utilizar el Software de conformidad con la legislación aplicable en la República
                Argentina, con las reglamentaciones del Poder Judicial de Mendoza y con los
                presentes Términos y Condiciones.
              </li>
              <li>
                No emplear el Software para la comisión de actos ilícitos, fraudes, ni para vulnerar
                la seguridad o integridad de terceros o de los sistemas del Poder Judicial de
                Mendoza.
              </li>
              <li>
                Mantener en todo momento la confidencialidad de las credenciales de acceso al
                Software, así como las claves de usuario y contraseña que le sean asignadas.
              </li>
              <li>
                Respetar las disposiciones sobre tratamiento de datos personales que resulten
                aplicables, incluyendo confidencialidad y no divulgación de información sensible de
                terceros.
              </li>
              <li>
                Emitir boletas únicamente cuando cuente con la autorización y documentación
                necesaria para ello, exonerando al Proveedor de cualquier responsabilidad derivada
                del uso inadecuado del Software en este aspecto.
              </li>
              <li>
                Mantener actualizadas las versiones del Software según las indicaciones del
                Proveedor, a efecto de garantizar la correcta funcionalidad y seguridad de la
                aplicación.
              </li>
            </ul>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              6. RESPONSABILIDAD Y LIMITACIÓN DE GARANTÍAS
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              6.1. El Software se suministra “tal cual” y sin ninguna clase de garantía expresa o
              implícita, incluyendo, sin limitarse a, garantías de comerciabilidad, idoneidad para
              un propósito particular, ausencia de vicios ocultos, o que su uso será ininterrumpido
              o libre de errores.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              6.2. El Proveedor no garantiza ni se hace responsable de:
            </p>
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
              <li>
                La disponibilidad, continuidad, eficacia o rendimiento del sitio del Poder Judicial
                de Mendoza ni de sus sistemas informáticos.
              </li>
              <li>
                La oportuna recepción o procesamiento de las boletas ingresadas a través del
                Software.
              </li>
              <li>
                Cualquier daño, perjuicio o lucro cesante que pudiera derivarse del uso o
                imposibilidad de uso del Software.
              </li>
              <li>
                Pérdidas de datos, demoras, interrupciones, errores o defectos de funcionamiento
                eventualmente ocasionados por factores técnicos externos, como caídas de conexión a
                Internet, mantenimiento del servidor, actualizaciones forzadas de la plataforma de
                destino o restricciones impuestas por terceros.
              </li>
            </ul>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              6.3. En ningún caso el Proveedor ni sus desarrolladores serán responsables por daños
              indirectos, emergentes, especiales, incidentales o punitivos, incluyendo pérdida de
              beneficios, pérdida de reputación, gastos legales, o cualquier otra consecuencia
              negativa que derive del uso o imposibilidad de uso del Software.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              7. EXCLUSIÓN DE ILEGALIDAD Y CUMPLIMIENTO NORMATIVO
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              7.1. El Usuario reconoce que, previa consulta a asesores legales, el Software no
              resulta ilegal en la forma en que ha sido concebido. No obstante, el Usuario asume la
              responsabilidad de verificar que sus propias actividades con el Software se ajusten a
              la normativa aplicable.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              7.2. El Proveedor no puede controlar ni supervisar las actividades específicas que
              cada Usuario ejecute con el Software en el sitio del Poder Judicial. Por lo tanto,
              cualquier acto que contravenga leyes penales, civiles o administrativas será
              responsabilidad exclusiva del Usuario.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              8. PROPIEDAD INTELECTUAL
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              8.1. El Software, su código fuente, manuales de usuario, documentación técnica y
              cualquier otro componente desarrollado por el Proveedor constituyen obras protegidas
              por las leyes de propiedad intelectual.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              8.2. El Usuario reconoce y acepta que todos los derechos de autor, marcas, patentes,
              know-how, secretos industriales y demás derechos sobre el Software pertenecen única y
              exclusivamente al Proveedor, o a los terceros licenciantes que hubieran aportado
              componentes al Software.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              8.3. Queda prohibida la reproducción total o parcial del Software sin la autorización
              previa y por escrito del titular de los derechos.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              9. PRIVACIDAD Y PROTECCIÓN DE DATOS
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              9.1. El Proveedor podrá recopilar datos mínimos necesarios para identificar de manera
              genérica el uso del Software (por ejemplo, estadísticas de instalación y versión), sin
              almacenar información personal sensible.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              9.2. El Usuario se obliga a ingresar únicamente datos verídicos y obtener las
              autorizaciones necesarias para el tratamiento de datos personales que pudieran surgir
              como parte del proceso de escaneo o generación de boletas.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              9.3. En caso de que el Software almacene temporalmente imágenes o datos de terceros
              (p. ej., boletas escaneadas), el Usuario se compromete a cumplir con la Ley de
              Protección de Datos Personales (Ley Nº 25.326) y sus reglamentaciones, manteniendo
              medidas de seguridad adecuadas para evitar accesos no autorizados.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              9.4. El Proveedor no asume responsabilidad alguna por eventuales filtraciones o usos
              indebidos que el Usuario o terceros lleven a cabo sobre los datos que se procesen con
              el Software ni por el incumplimiento de la normativa de privacidad.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              10. MODIFICACIONES AL SOFTWARE Y A LOS TÉRMINOS
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              10.1. El Proveedor se reserva el derecho de modificar, actualizar, mejorar o
              discontinuar total o parcialmente el Software sin necesidad de previo aviso al
              Usuario, siempre que ello no afecte negativamente la seguridad ni la operatividad
              esencial de la última versión en uso.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              10.2. Asimismo, el Proveedor podrá en cualquier momento modificar estos Términos y
              Condiciones. Las modificaciones entrarán en vigencia a partir de su publicación en el
              sitio web oficial del Proveedor o del propio instalador/actualizador del Software. El
              uso continuado del Software después de dichas modificaciones implica la aceptación de
              los nuevos Términos y Condiciones.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              11. TERMINACIÓN DE LA LICENCIA
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              11.1. La licencia otorgada al Usuario podrá darse por terminada de pleno derecho, sin
              necesidad de intervención judicial, en caso de incumplimiento de cualquiera de las
              obligaciones establecidas en estos Términos y Condiciones.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              11.2. En caso de terminación, el Usuario se obliga a:
            </p>
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
              <li>Desinstalar y eliminar cualquier copia del Software de sus dispositivos.</li>
              <li>
                Destruir o devolver al Proveedor, a elección de este último, cualquier documentación
                o soporte relacionado con el Software.
              </li>
            </ul>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              11.3. La terminación no exime al Usuario de las responsabilidades incurridas con
              anterioridad al cese del uso ni de las sanciones contractuales o legales aplicables.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              12. VIGENCIA Y LEY APLICABLE
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              12.1. Estos Términos y Condiciones entrarán en vigencia a partir de la fecha en que el
              Usuario acepte los mismos durante el proceso de instalación o, en su defecto, en el
              momento del primer uso del Software.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              12.2. Para cualquier discrepancia o conflicto que surja en relación con la
              interpretación, cumplimiento o ejecución de estos Términos y Condiciones, las partes
              se someten expresamente a la jurisdicción de los tribunales de la Provincia de
              Mendoza, renunciando a cualquier otro fuero o jurisdicción que pudiera
              corresponderles.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              13. CONTACTO
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Si el Usuario tiene consultas, reclamos o solicita información adicional sobre estos
              Términos y Condiciones o sobre el uso del Software, podrá contactarse a:
            </p>
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
              <li>
                <strong>Email de soporte:</strong> soporte@aftercode.com.ar
              </li>
              <li>
                <strong>Dirección postal:</strong> Calle Falsa 123, Ciudad de Mendoza, Provincia de
                Mendoza, Argentina
              </li>
              <li>
                <strong>Teléfono:</strong> +54 261 123-4567
              </li>
            </ul>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              14. CLÁUSULA DE INDEMNIDAD
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              El Usuario se obliga a mantener indemne y a resguardar al Proveedor, sus directores,
              empleados, agentes y representantes respecto de cualquier reclamo, demanda, sanción,
              multa, pérdida, daño o gasto (incluidos honorarios de abogados) que pudieren derivarse
              del uso indebido del Software, de la vulneración de normativa aplicable, o de la
              violación de derechos de terceros en el contexto de la utilización del Software.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-2xl mt-6 font-semibold tracking-tight first:mt-0">
              15. DISPOSICIONES FINALES
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              15.1. La eventual nulidad o ineficacia de alguna de las cláusulas aquí contenidas no
              afectará la validez del resto de las disposiciones; aquélla se considerará separable y
              subsistirán los demás derechos y obligaciones definidos en este documento.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              15.2. Estos Términos y Condiciones constituyen el acuerdo completo y definitivo entre
              las partes en relación con el uso del Software, reemplazando cualquier comunicación
              previa, oral o escrita, relacionada con el mismo.
            </p>

            <hr />

            <p className="leading-7 [&:not(:first-child)]:mt-6">
              <em>
                El Usuario declara haber leído, entendido y aceptado en su totalidad los presentes
                Términos y Condiciones de Uso, obligándose a darles estricto cumplimiento desde el
                momento en que instale o utilice el Software “Automat Boletas”.
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
