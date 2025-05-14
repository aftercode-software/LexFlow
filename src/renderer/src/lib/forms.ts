export async function fetchDniData(
  dni: string
): Promise<{ nombre: string; domicilio: string } | null> {
  try {
    // Le pedimos al main process que busque el demandado
    const result = await window.api.searchDemandado(dni)

    // Si el backend devolvió datos válidos, los retornamos,
    // de lo contrario devolvemos null para indicar que no existe.
    if (result && result.nombre && result.domicilio) {
      return {
        nombre: result.nombre,
        domicilio: result.domicilio
      }
    }
    return null
  } catch (error) {
    console.error('Error al buscar datos por DNI via IPC:', error)
    // Propaga el error para que el caller lo maneje y muestre warning
    throw error
  }
}
