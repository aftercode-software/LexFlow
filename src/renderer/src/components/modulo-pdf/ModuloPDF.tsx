import { DatosProfesional, DatosTercero } from '@renderer/lib/types'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
import ProcesarPDF from './ProcesarPDF'
import FormProfesionales from './forms/FormProfesionales'
import FormTerceros from './forms/FormTerceros'

export enum PDFType {
  PROFESIONAL,
  TERCERO
}

export default function ModuloPDF() {
  const [typePDF, setTypePDF] = useState<'profesional' | 'tercero' | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<DatosTercero | DatosProfesional | null>(null)

  useEffect(() => {
    console.log('Changing file')
  }, [file])

  const handleProcess = () => {
    if (file && typePDF) {
      const reader = new FileReader()
      console.log('?')
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer
        try {
          const extractedData = await window.api.extractDataFromPdf(arrayBuffer, typePDF)
          setExtractedData(extractedData)
          console.log('Data updated:', extractedData)
        } catch (error) {
          alert(error)
          return
        }
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
        typePdf={typePDF}
        setTypePDF={setTypePDF}
      />

      {extractedData && (
        <Card>
          <CardHeader>
            <p className="text-lg font-medium text-gray-800">Datos extraídos:</p>
            <p className="text-sm text-gray-500">Revisá los datos extraídos del PDF</p>
          </CardHeader>
          <CardContent>
            {typePDF === 'tercero' && file && <FormTerceros {...(extractedData as DatosTercero)} />}
            {typePDF === 'profesional' && file && (
              <FormProfesionales {...(extractedData as DatosProfesional)} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
