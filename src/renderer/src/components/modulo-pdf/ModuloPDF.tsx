import { useState } from 'react'
import ProcesarPDF from './ProcesarPDF'

export enum PDFTypes {
  Profesional = 'profesional',
  Tercero = 'tercero'
}

export default function ModuloPDF() {
  const [typePDF, setTypePDF] = useState<PDFTypes | null>()
  const [file, setFile] = useState<File | null>(null)

  const handleProcess = () => {
    if (file) {
      const reader = new FileReader()
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer
        const test = await window.api.extractDataFromPdf(arrayBuffer)
        console.log('Data: ', test)
      }
      reader.readAsArrayBuffer(file)
    }
  }

  return (
    <div className="p-4 flex flex-col min-h-screen">
      <h1 className="text-3xl font-bold">Módulo PDF</h1>
      <ProcesarPDF
        file={file}
        setFile={setFile}
        handleProcess={handleProcess}
        setTypePDF={setTypePDF}
      />
      {typePDF === PDFTypes.Profesional && <div>asd</div>}
    </div>
  )
}
