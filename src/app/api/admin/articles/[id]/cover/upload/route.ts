import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import sharp from 'sharp'
import pool from '@/lib/db'
import { requirePermission } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'
import { ARTICLE_CACHE_TAG } from '@/lib/cache-tags'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function articleUploadsDir() {
  return process.env.KHUA_ARTICLE_UPLOADS_DIR
    ? path.resolve(process.env.KHUA_ARTICLE_UPLOADS_DIR)
    : path.join(process.cwd(), 'public', 'uploads', 'articles')
}

function safeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'article'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const { id } = await params
  const formData = await request.formData()
  const file = formData.get('cover')

  if (!(file instanceof File)) {
    return Response.json({ error: 'Cover image is required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: 'Unsupported file type. Use JPG, PNG, or WebP.' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: 'Cover image is too large. Maximum size is 8 MB.' }, { status: 400 })
  }

  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(
      'SELECT id, slug FROM articles WHERE id = ? LIMIT 1',
      [id],
    )
    const article = (rows as Array<{ id: number; slug: string }>)[0]
    if (!article) {
      return Response.json({ error: 'Article not found' }, { status: 404 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const filename = `${safeSlug(article.slug)}-${Date.now().toString(36)}.png`
    const uploadDir = articleUploadsDir()
    const imagePath = path.join(uploadDir, filename)

    const output = await sharp(bytes)
      .rotate()
      .resize(1536, 1024, { fit: 'cover', position: 'center' })
      .png({ quality: 92, compressionLevel: 8 })
      .toBuffer()

    await mkdir(uploadDir, { recursive: true })
    await writeFile(imagePath, output)

    const coverImageUrl = `/uploads/articles/${filename}`
    await connection.execute(
      'UPDATE articles SET cover_image_url = ?, image_prompt = NULL WHERE id = ?',
      [coverImageUrl, id],
    )
    revalidateTag(ARTICLE_CACHE_TAG, 'max')

    return Response.json({
      cover_image_url: coverImageUrl,
      image_prompt: '',
    })
  } catch (error) {
    console.error('Upload article cover error:', error)
    return Response.json({ error: 'Failed to upload cover image' }, { status: 500 })
  } finally {
    connection.release()
  }
}
