import type { ResultSetHeader } from 'mysql2'
import type { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { requirePermission, AuthContext } from '@/lib/api-auth'
import { PERMISSIONS } from '@/lib/permissions'

const LOCALES = ['th', 'en', 'lo', 'zh'] as const

type LocaleCode = (typeof LOCALES)[number]

interface AiTranslation {
  locale: LocaleCode
  title: string
  excerpt: string
  category: string
  date_label: string
  read_time: string
  tags: string[]
  highlights: string[]
  content: string[]
  meta_title: string
  meta_description: string
}

interface AiArticlePayload {
  slug: string
  status: 'draft' | 'published'
  published_at: string | null
  translations: AiTranslation[]
}

function todayBangkok() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || `article-${Date.now().toString(36)}`
}

function cleanStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback
  return value.map((item) => String(item).trim()).filter(Boolean)
}

function normalizeArticlePayload(
  value: unknown,
  source: { category: string; status: string; publishedAt: string },
): AiArticlePayload {
  const payload = value as Partial<AiArticlePayload>
  const translations = Array.isArray(payload.translations) ? payload.translations : []
  const normalizedTranslations = LOCALES.map((locale) => {
    const found = translations.find((item) => item?.locale === locale) as Partial<AiTranslation> | undefined
    if (!found?.title) {
      throw new Error(`AI response is missing ${locale} translation`)
    }

    return {
      locale,
      title: String(found.title || '').trim(),
      excerpt: String(found.excerpt || '').trim(),
      category: String(found.category || source.category).trim(),
      date_label: String(found.date_label || source.publishedAt).trim(),
      read_time: String(found.read_time || '6 min read').trim(),
      tags: cleanStringArray(found.tags, [source.category]),
      highlights: cleanStringArray(found.highlights).slice(0, 3),
      content: cleanStringArray(found.content),
      meta_title: String(found.meta_title || found.title || '').trim(),
      meta_description: String(found.meta_description || found.excerpt || '').trim(),
    }
  })

  const slugSource = payload.slug || normalizedTranslations[1]?.title || normalizedTranslations[0].title
  return {
    slug: slugify(String(slugSource)),
    status: payload.status === 'published' || source.status === 'published' ? 'published' : 'draft',
    published_at: source.publishedAt ? `${source.publishedAt} 08:00:00` : null,
    translations: normalizedTranslations,
  }
}

function extractOutputText(response: unknown) {
  const data = response as {
    output_text?: string
    output?: Array<{ content?: Array<{ text?: string; type?: string }> }>
  }
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text

  return data.output
    ?.flatMap((item) => item.content ?? [])
    .map((item) => item.text || '')
    .join('')
    .trim() || ''
}

async function buildArticleWithAi(input: {
  source: string
  category: string
  status: string
  publishedAt: string
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for AI article import')
  }

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['slug', 'status', 'published_at', 'translations'],
    properties: {
      slug: { type: 'string' },
      status: { type: 'string', enum: ['draft', 'published'] },
      published_at: { type: ['string', 'null'] },
      translations: {
        type: 'array',
        minItems: 4,
        maxItems: 4,
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'locale',
            'title',
            'excerpt',
            'category',
            'date_label',
            'read_time',
            'tags',
            'highlights',
            'content',
            'meta_title',
            'meta_description',
          ],
          properties: {
            locale: { type: 'string', enum: LOCALES },
            title: { type: 'string' },
            excerpt: { type: 'string' },
            category: { type: 'string' },
            date_label: { type: 'string' },
            read_time: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            highlights: { type: 'array', items: { type: 'string' } },
            content: { type: 'array', items: { type: 'string' } },
            meta_title: { type: 'string' },
            meta_description: { type: 'string' },
          },
        },
      },
    },
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_ARTICLE_MODEL || process.env.OPENAI_MODEL || 'gpt-5',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: [
                'You prepare premium SEO articles for KHUA, a Phayao-style Northern Thai food brand.',
                'Convert the raw article brief into a complete database-ready article in Thai, English, Lao, and Simplified Chinese.',
                'Preserve the Thai article intent and cultural details. Do not invent unverifiable claims.',
                'Use Markdown-style content blocks: headings start with "# " or "## ", lists may be one block with lines starting "* ".',
                'Include FAQ blocks when the source includes FAQ. Keep product recommendations natural and link-aware in text only.',
                'Slug must be lowercase romanized English words, SEO-friendly, and not include locale prefixes.',
              ].join(' '),
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify({
                category: input.category,
                status: input.status,
                publishedAt: input.publishedAt,
                source: input.source,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'khua_article_import',
          schema,
          strict: true,
        },
      },
    }),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`OpenAI article import failed: ${response.status} ${text.slice(0, 500)}`)
  }

  const outputText = extractOutputText(JSON.parse(text))
  if (!outputText) throw new Error('OpenAI article import returned no structured text')
  return normalizeArticlePayload(JSON.parse(outputText), input)
}

async function uniqueSlug(connection: Awaited<ReturnType<typeof pool.getConnection>>, baseSlug: string) {
  let slug = baseSlug
  let suffix = 2

  while (true) {
    const [rows] = await connection.execute('SELECT id FROM articles WHERE slug = ? LIMIT 1', [slug])
    if ((rows as unknown[]).length === 0) return slug
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(PERMISSIONS.MANAGE_ARTICLES)
  if (auth instanceof Response) return auth

  const ctx = auth as AuthContext
  const body = await request.json().catch(() => ({})) as {
    source?: unknown
    category?: unknown
    status?: unknown
    published_at?: unknown
    cover_image_url?: unknown
  }

  const source = typeof body.source === 'string' ? body.source.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  const status = body.status === 'published' ? 'published' : 'draft'
  const publishedAt = typeof body.published_at === 'string' && body.published_at.trim()
    ? body.published_at.trim()
    : todayBangkok()
  const coverImageUrl = typeof body.cover_image_url === 'string' ? body.cover_image_url.trim() : ''

  if (!source) return Response.json({ error: 'Article details are required' }, { status: 400 })
  if (!category) return Response.json({ error: 'Category is required' }, { status: 400 })
  if (source.length > 20000) {
    return Response.json({ error: 'Article details must be 20,000 characters or fewer' }, { status: 400 })
  }

  let connection: Awaited<ReturnType<typeof pool.getConnection>> | null = null

  try {
    const article = await buildArticleWithAi({ source, category, status, publishedAt })
    connection = await pool.getConnection()
    const slug = await uniqueSlug(connection, article.slug)

    await connection.beginTransaction()
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO articles (slug, status, cover_image_url, image_prompt, published_at, author_id)
       VALUES (?, ?, ?, NULL, ?, ?)`,
      [
        slug,
        article.status,
        coverImageUrl || null,
        article.status === 'published' ? article.published_at : null,
        ctx.user.id,
      ],
    )

    const articleId = result.insertId
    for (const translation of article.translations) {
      await connection.execute(
        `INSERT INTO article_translations
         (article_id, locale, title, excerpt, category, date_label, read_time, tags_json, highlights_json, content_json, meta_title, meta_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          articleId,
          translation.locale,
          translation.title,
          translation.excerpt,
          translation.category,
          translation.date_label,
          translation.read_time,
          JSON.stringify(translation.tags),
          JSON.stringify(translation.highlights),
          JSON.stringify(translation.content),
          translation.meta_title,
          translation.meta_description,
        ],
      )
    }

    await connection.commit()
    return Response.json({ id: articleId, slug }, { status: 201 })
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {})
    console.error('AI article import error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to import article with AI' },
      { status: 500 },
    )
  } finally {
    connection?.release()
  }
}
