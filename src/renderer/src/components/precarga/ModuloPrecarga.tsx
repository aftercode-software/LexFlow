export const ModuloPrecarga = () => {
  return (
    <div>
      <button onClick={() => window.api.iniciarLoginManual()}>Iniciar sesión manual</button>

      <button onClick={() => window.api.iniciarPrecarga()}>Procesar boletas</button>
    </div>
  )
}
