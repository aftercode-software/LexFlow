import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '../ui/button'
import PDFUploader from './PDFUploader'

export default function ProcesarPDF({
  file,
  setFile,
  handleProcess,
  typePdf,
  setTypePDF
}: {
  file: File | null
  setFile: React.Dispatch<React.SetStateAction<File | null>>
  handleProcess: () => void
  typePdf: 'profesional' | 'tercero' | null
  setTypePDF: (type: 'profesional' | 'tercero') => void
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
          <Select onValueChange={(value) => setTypePDF(value as 'profesional' | 'tercero')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo de documento" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="profesional">Profesional</SelectItem>
              <SelectItem value="tercero">Tercero</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" disabled={!file || !typePdf} onClick={handleProcess}>
          Procesar
        </Button>
      </CardContent>
    </Card>
  )
}
