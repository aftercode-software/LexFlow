import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { FileUpload } from '@renderer/components/modulo-pdf/FileUpload'
import FormProfesionales from '@renderer/components/modulo-pdf/forms/FormProfesionales'
import FormTerceros from '@renderer/components/modulo-pdf/forms/FormTerceros'
import type { FormularioProfesionales, FormularioTerceros } from '@renderer/lib/types'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'

enum Steps {
  UPLOAD = 1,
  REVIEW = 2
}

export default function ScanBoletas() {
  const [step, setStep] = useState<Steps>(Steps.UPLOAD)
  const [file, setFile] = useState<File | null>(null)
  const [typePDF, setTypePDF] = useState<'profesional' | 'tercero' | null>(null)
  const [extractedData, setExtractedData] = useState<
    FormularioProfesionales | FormularioTerceros | null
  >(null)
  const [originalPdfPath, setOriginalPdfPath] = useState<string>('')

  const handleProcess = () => {
    if (!file || !typePDF) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const buffer = reader.result as ArrayBuffer
        const { data, originalPdfPath } = await window.api.extractDataFromPdf(buffer, typePDF)

        console.log('Ruta del PDF original:', originalPdfPath)
        setExtractedData(data)
        setOriginalPdfPath(originalPdfPath)
        setStep(Steps.REVIEW)
      } catch (e) {
        alert(e)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="p-6 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col items-left">
          {step !== Steps.UPLOAD && (
            <section>
              <Button
                variant="ghost"
                onClick={() => setStep(Steps.UPLOAD)}
                className="hover:bg-pink-50 hover:text-pink-500 text-left"
              >
                <ChevronLeft className="w-4 h-4 text-pink-500" />
                Volver
              </Button>
            </section>
          )}

          <h1 className="text-2xl font-bold text-black">Escanear boletas</h1>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 w-full">
        <StepIndicator number="1" label="Subir PDF" active={step === Steps.UPLOAD} />
        <div className="w-full h-[2px] bg-gray-100 mx-4" />
        <StepIndicator number="2" label="Revisar datos" active={step === Steps.REVIEW} />
      </div>

      {/* Paso 1 */}
      {step === Steps.UPLOAD && (
        <Card>
          <CardContent className="mt-6 space-y-6">
            <div>
              <Label className="text-base font-medium mb-2 block">Tipo de documento</Label>
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

            <div>
              <Label className="text-base font-medium mb-2 block">Archivo PDF</Label>
              <FileUpload file={file} onFileChange={setFile} />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleProcess}
                disabled={!file || !typePDF}
                className="bg-pink-500 hover:bg-pink-600 text-white"
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
            <p className="text-xl font-medium text-gray-800">
              Boleta de {typePDF === 'profesional' ? 'Profesionales' : 'Terceros'}
            </p>
            <p className="text-base text-gray-500">
              Revisá que los datos sean correctos antes de enviar
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6">
              {typePDF === 'profesional' ? (
                <FormProfesionales
                  estado={''}
                  {...(extractedData as FormularioProfesionales)}
                  pdfRoute={originalPdfPath}
                />
              ) : (
                <FormTerceros
                  estado={''}
                  {...(extractedData as FormularioTerceros)}
                  pdfRoute={originalPdfPath}
                />
              )}
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
          active ? 'bg-pink-500 text-white' : 'border border-gray text-gray-500'
        }`}
      >
        {number}
      </div>
      <span className={`ml-2 font-medium ${active ? 'text-pink-500' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}
