/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@renderer/components/modulo-pdf/FileUpload'
import FormProfesionales from '@renderer/components/modulo-pdf/forms/FormProfesionales'
import FormTerceros from '@renderer/components/modulo-pdf/forms/FormTerceros'
import Title from '@renderer/components/Title'
import { FormularioProfesionales, FormularioTerceros } from '@shared/interfaces/form'

import { BriefcaseBusiness, ChevronLeft, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

enum Steps {
  UPLOAD = 1,
  REVIEW = 2
}

export default function ScanBoletas() {
  const [step, setStep] = useState<Steps>(Steps.UPLOAD)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
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
        setLoading(true)
        const { data, originalPdfPath } = await window.api.extractDataFromPdf(buffer, typePDF)

        console.log('Ruta del PDF original:', originalPdfPath)
        setExtractedData(data)
        setOriginalPdfPath(originalPdfPath)
        setStep(Steps.REVIEW)
      } catch (e) {
        if (
          typeof e === 'object' &&
          e &&
          'message' in e &&
          typeof (e as any).message === 'string' &&
          (e as any).message.includes(
            "Error invoking remote method 'pdf:extract-data': Error: Input Buffer is empty"
          )
        ) {
          toast.error('Error al escanear la boleta, verifica que el tipo sea el correcto')
        } else {
          console.error('Error al procesar el PDF:', e)
          alert(e)
        }
      } finally {
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleSubmitForm = () => {
    setLoading(true)
    const formElement = document.querySelector('form#boleta-form') as HTMLFormElement
    if (formElement) {
      formElement.requestSubmit()
    }
  }

  const handleFormComplete = () => {
    setLoading(false)
    setStep(Steps.UPLOAD)
  }

  return (
    <div className="p-6 flex flex-col min-h-screen ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-row justify-between w-full items-center">
          <Title
            title="Escanear Boletas"
            subtitle="Subí el escaneo de tu boleta profesional o tercero y generá la boleta automáticamente"
          />

          {step !== Steps.UPLOAD && (
            <section>
              <Button
                variant="ghost"
                onClick={() => setStep(Steps.UPLOAD)}
                className="hover:bg-lex/10 hover:text-lex text-left"
              >
                <ChevronLeft className="w-4 h-4 text-lex" />
                Volver
              </Button>
            </section>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 w-full">
        <StepIndicator number="1" label="Subir PDF" active={step === Steps.UPLOAD} />
        <div className="w-full h-[2px] bg-zinc-100 mx-4" />
        <StepIndicator number="2" label="Revisar datos" active={step === Steps.REVIEW} />
      </div>

      {/* Paso 1 */}
      {step === Steps.UPLOAD && (
        <Card>
          <CardContent className="mt-6 space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Tipo de documento</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Profesional Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    typePDF === 'profesional'
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTypePDF('profesional')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          typePDF === 'profesional'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <BriefcaseBusiness className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Profesional</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Boleta de servicios profesionales
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tercero Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    typePDF === 'tercero'
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTypePDF('tercero')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          typePDF === 'tercero'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Tercero</h3>
                        <p className="text-sm text-gray-500 mt-1">Boleta de terceros</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-2 block">Archivo PDF</Label>
              <FileUpload file={file} onFileChange={setFile} />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleProcess}
                disabled={!file || !typePDF || loading}
                className=" bg-lex/80 hover:bg-lex text-white"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                ) : (
                  'Escanear'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 2 */}
      {step === Steps.REVIEW && extractedData && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <aside>
              <p className="text-xl font-medium text-zinc-800">
                Boleta de {typePDF === 'profesional' ? 'Profesionales' : 'Terceros'}
              </p>
              <p className="text-base text-zinc-500">
                Revisá que los datos sean correctos antes de enviar
              </p>
            </aside>
            <Button size="lg" onClick={handleSubmitForm}>
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
              ) : (
                'Generar escrito'
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6">
              {typePDF === 'profesional' ? (
                <FormProfesionales
                  estado={''}
                  {...(extractedData as FormularioProfesionales)}
                  pdfRoute={originalPdfPath}
                  onComplete={handleFormComplete}
                />
              ) : (
                <FormTerceros
                  estado={''}
                  {...(extractedData as FormularioTerceros)}
                  pdfRoute={originalPdfPath}
                  onComplete={handleFormComplete}
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
          active ? 'bg-lex text-white' : 'border border-gray text-zinc-500'
        }`}
      >
        {number}
      </div>
      <span className={`ml-2 font-medium ${active ? 'text-lex' : 'text-zinc-500'}`}>{label}</span>
    </div>
  )
}
