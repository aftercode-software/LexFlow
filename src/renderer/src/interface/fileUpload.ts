export type FileUploadProps = {
  onFileChange: (file: File | null) => void
  file: File | null
  accept?: Record<string, string[]>
  maxSize?: number
}
