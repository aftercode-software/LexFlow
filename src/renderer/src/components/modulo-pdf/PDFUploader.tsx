export default function PDFUploader({
  setFile
}: {
  setFile: React.Dispatch<React.SetStateAction<File | null>>
}) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
  }

  return (
    <div className="flex flex-col items-end">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="border-2 border-gray-300 p-2 rounded-lg"
      />
    </div>
  )
}
