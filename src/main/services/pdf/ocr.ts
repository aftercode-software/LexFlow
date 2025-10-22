/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */
import sharp from 'sharp'

export function getTextFromImage(
  worker: Tesseract.Worker,
  imageBuf: Buffer,
  params?: Record<string, string | number>
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      if (params) await worker.setParameters(params as any)
      const {
        data: { text }
      } = await worker.recognize(imageBuf)
      resolve(text ?? '')
    } catch (e) {
      console.error('Error al reconocer el texto:', e)
      reject(e)
    }
  })
}

export async function cropRelative(
  img: Buffer,
  x: number,
  y: number,
  w: number,
  h: number
): Promise<Buffer> {
  const meta = await sharp(img).metadata()
  const W = meta.width!,
    H = meta.height!
  return sharp(img)
    .extract({
      left: Math.round(W * x),
      top: Math.round(H * y),
      width: Math.round(W * w),
      height: Math.round(H * h)
    })
    .toBuffer()
}
