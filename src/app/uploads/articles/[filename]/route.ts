import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ARTICLE_IMAGE_NAME = /^[a-z0-9][a-z0-9-]*\.png$/i

function articleUploadsDir() {
  return process.env.KHUA_ARTICLE_UPLOADS_DIR
    ? path.resolve(process.env.KHUA_ARTICLE_UPLOADS_DIR)
    : path.join(process.cwd(), 'public', 'uploads', 'articles')
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params

  if (!ARTICLE_IMAGE_NAME.test(filename)) {
    return new Response('Not found', { status: 404 })
  }

  const uploadsDir = articleUploadsDir()
  const imagePath = path.join(uploadsDir, filename)

  try {
    const imageStat = await stat(imagePath)
    if (!imageStat.isFile()) {
      return new Response('Not found', { status: 404 })
    }

    const image = await readFile(imagePath)
    return new Response(image, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': String(image.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
