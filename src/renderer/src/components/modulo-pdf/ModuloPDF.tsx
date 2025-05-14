import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, RotateCcw } from 'lucide-react'
import FormProfesionales from './forms/FormProfesionales'
import FormTerceros from './forms/FormTerceros'
import { DatosProfesional, DatosTercero } from '@renderer/lib/types'

// Definimos los pasos del wizard
enum Steps {
  UPLOAD = 1,
  REVIEW = 2
}

export default function EscanearBoleta() {
  const [step, setStep] = useState<Steps>(Steps.UPLOAD)
  const [file, setFile] = useState<File | null>(null)
  const [typePDF, setTypePDF] = useState<'profesional' | 'tercero' | null>(null)
  const [extractedData, setExtractedData] = useState<DatosProfesional | DatosTercero | null>(null)

  // Resetea todo para subir un nuevo PDF
  const reset = () => {
    setFile(null)
    setTypePDF(null)
    setExtractedData(null)
    setStep(Steps.UPLOAD)
  }

  // Drag & drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) setFile(acceptedFiles[0])
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [] },
    multiple: false
  })

  // Escanea el PDF
  const handleProcess = () => {
    if (!file || !typePDF) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const buffer = reader.result as ArrayBuffer
        const data = await window.api.extractDataFromPdf(buffer, typePDF)
        setExtractedData(data)
        setStep(Steps.REVIEW)
      } catch (e) {
        alert(e)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Envía los datos corregidos
  const handleSubmit = () => {
    console.log('Enviar al servidor:', extractedData)
    // lógica de envío
  }

  return (
    <div className="p-6 flex flex-col min-h-screen bg-aftercode\/5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => setStep(Steps.UPLOAD)}
            className="text-aftercode hover:bg-aftercode/5 size-8 rounded-full"
          >
            <ChevronLeft className="w-4 h-4 text-aftercode" />
          </Button>

          <h1 className="text-2xl font-bold text-black">Módulo de Extracción PDF</h1>
        </div>
        <Button
          variant="ghost"
          onClick={reset}
          className="text-gray-700 hover:text-aftercode hover:bg-aftercode/5"
        >
          <RotateCcw />
          Subir nuevo PDF
        </Button>
      </div>

      <div className="flex items-center justify-between mb-8 w-full">
        <StepIndicator number="1" label="Subir PDF" active={step === Steps.UPLOAD} />
        <div className="w-full h-[2px] bg-gray-100 mx-4" />
        <StepIndicator number="2" label="Revisar datos" active={step === Steps.REVIEW} />
      </div>

      {/* Paso 1 */}
      {step === Steps.UPLOAD && (
        <Card>
          <CardContent className="mt-4">
            <div className="my-4">
              <Label>Tipo de documento</Label>
              <Select onValueChange={(val) => setTypePDF(val as 'profesional' | 'tercero')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profesional">Profesional</SelectItem>
                  <SelectItem value="tercero">Tercero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed p-8 rounded cursor-pointer text-center transition-colors ${
                isDragActive ? 'border-aftercode bg-aftercode/5' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <p>{file.name}</p>
              ) : (
                <p>Arrastra y suelta tu PDF aquí, o haz click para seleccionar</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleProcess}
                disabled={!file || !typePDF}
                className="hover:bg-aftercode"
              >
                Escanear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 2 */}
      {step === Steps.REVIEW && extractedData && (
        <Card>
          <CardHeader>
            <p className="text-lg font-medium text-gray-800">Datos extraídos</p>
            <p className="text-sm text-gray-500">Revisá la información antes de enviar</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6">
              {typePDF === 'profesional' ? (
                <FormProfesionales {...(extractedData as DatosProfesional)} />
              ) : (
                <FormTerceros {...(extractedData as DatosTercero)} />
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSubmit}>Enviar datos</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface StepIndicatorProps {
  number: string
  label: string
  active: boolean
}

function StepIndicator({ number, label, active }: StepIndicatorProps) {
  return (
    <div className={`flex items-center whitespace-nowrap ${active ? '' : 'opacity-70'}`}>
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
          active ? 'bg-aftercode text-white' : 'border border-gray text-gray-500'
        }`}
      >
        {number}
      </div>
      <span className={`ml-2 font-medium ${active ? 'text-aftercode' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}
