/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */
import sharp from 'sharp'
import { PSM } from 'tesseract.js'
import { normalizeOCRStrong } from './helpers'

const PROFILE_PARAMS: Record<OcrProfile, Record<string, string>> = {
  header: {
    tessedit_pageseg_mode: String(PSM.SPARSE_TEXT),
    tessedit_char_whitelist:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÜÑabcdefghijklmnopqrstuvwxyzáéíóúüñ0123456789-./,:() '
  },
  line: {
    tessedit_pageseg_mode: String(PSM.SINGLE_LINE),
    tessedit_char_whitelist:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÜÑabcdefghijklmnopqrstuvwxyzáéíóúüñ0123456789-./,:() '
  },
  table: {
    tessedit_pageseg_mode: String(PSM.SPARSE_TEXT_OSD),
    tessedit_char_whitelist:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÜÑabcdefghijklmnopqrstuvwxyzáéíóúüñ0123456789-./,:()% '
  },
  digits: {
    tessedit_pageseg_mode: String(PSM.SINGLE_BLOCK),
    tessedit_char_whitelist: '0123456789.,- %'
  },
  alnum: {
    tessedit_pageseg_mode: String(PSM.AUTO),
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÜÑ0123456789-./,:() '
  }
}

type OcrProfile = 'header' | 'line' | 'table' | 'digits' | 'alnum'
export async function getTextFromImage(
  worker: Tesseract.Worker,
  imageBuf: Buffer,
  profile: OcrProfile = 'line',
  overrides?: Record<string, string | number>,
  normalize: boolean = true
): Promise<string> {
  const base = PROFILE_PARAMS[profile] ?? PROFILE_PARAMS.line
  const merged: Record<string, string> = { ...base }
  if (overrides) {
    for (const [k, v] of Object.entries(overrides)) merged[k] = String(v)
  }
  await worker.setParameters(merged)

  const {
    data: { text }
  } = await worker.recognize(imageBuf)
  let out = (text ?? '').trim()

  if (out.length < 2) {
    //@ts-ignore
    const fallbacks: number[] =
      profile === 'line'
        ? [PSM.SINGLE_BLOCK, PSM.SPARSE_TEXT]
        : profile === 'digits'
          ? [PSM.SPARSE_TEXT, PSM.AUTO]
          : [PSM.SPARSE_TEXT, PSM.SINGLE_BLOCK]

    for (const psm of fallbacks) {
      await worker.setParameters({
        //@ts-ignore
        tessedit_pageseg_mode: String(psm)
      })
      const {
        data: { text: t2 }
      } = await worker.recognize(imageBuf)
      out = (t2 ?? '').trim()
      if (out.length >= 2) break
    }
  }

  return normalize ? normalizeOCRStrong(out) : out
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
