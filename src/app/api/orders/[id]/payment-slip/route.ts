import { mkdir, writeFile } from 'fs/promises'
import { extname, join } from 'path'
import { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { id } = await params
  const formData = await request.formData()
  const file = formData.get('slip')

  if (!(file instanceof File)) {
    return Response.json({ error: 'Payment slip is required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: 'File is too large' }, { status: 400 })
  }

  const connection = await pool.getConnection()
  try {
    const [orders] = await connection.execute(
      'SELECT id FROM orders WHERE id = ? AND user_id = ?',
      [id, auth.user.id],
    )
    if ((orders as any[]).length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const safeExt = extname(file.name).toLowerCase() || '.jpg'
    const filename = `order-${id}-${Date.now()}${safeExt}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'slips')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), bytes)

    const slipUrl = `/uploads/slips/${filename}`
    await connection.execute(
      `UPDATE orders
       SET payment_status = 'submitted',
           payment_slip_url = ?,
           payment_submitted_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [slipUrl, id, auth.user.id],
    )

    return Response.json({ payment_slip_url: slipUrl, payment_status: 'submitted' })
  } catch (error) {
    console.error('Upload payment slip error:', error)
    return Response.json({ error: 'Failed to upload payment slip' }, { status: 500 })
  } finally {
    connection.release()
  }
}
