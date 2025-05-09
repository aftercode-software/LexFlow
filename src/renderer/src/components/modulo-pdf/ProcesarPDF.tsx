import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PDFTypes } from './ModuloPDF'
import PDFUploader from './PDFUploader'

export default function ProcesarPDF({
  file,
  setFile,
  handleProcess,
  setTypePDF
}: {
  file: File | null
  setFile: React.Dispatch<React.SetStateAction<File | null>>
  handleProcess: () => void
  setTypePDF: (type: PDFTypes) => void
}) {
  return (
    <Card className="w-fit">
      <CardHeader>
        <p className="text-lg font-medium text-gray-800">Subí tu archivo PDF acá:</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <PDFUploader setFile={setFile} />

        <div>
          <Label>Tipo de documento</Label>
          <Select
            onValueChange={(value) => {
              if (value === 'profesional') {
                setTypePDF(PDFTypes.Profesional)
              }
              if (value === 'tercero') {
                setTypePDF(PDFTypes.Tercero)
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profesional">Profesional</SelectItem>
              <SelectItem value="tercero">Tercero</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          className="border-2 border-blue-500 p-1 rounded-lg"
          onClick={handleProcess}
          disabled={!file}
        >
          Procesar PDF
        </button>
      </CardContent>
    </Card>
  )
}
