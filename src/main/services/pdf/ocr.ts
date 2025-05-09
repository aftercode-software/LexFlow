export function getTextFromImage(worker: Tesseract.Worker, imagePath: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    worker
      .recognize(imagePath)
      .then(({ data: { text } }) => {
        resolve(text)
      })
      .catch((error) => {
        console.error('Error al reconocer el texto:', error)
        reject(error)
      })
  })
}
