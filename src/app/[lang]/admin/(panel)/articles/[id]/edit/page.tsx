import pool from '@/lib/db'
import ArticleEditor from '@/components/admin/ArticleEditor'
import { notFound } from 'next/navigation'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params

  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(
      `SELECT a.id, a.slug, a.status, a.cover_image_url, a.image_prompt,
              a.published_at, a.meta_title, a.meta_description
       FROM articles a WHERE a.id = ?`,
      [id],
    )
    const articles = rows as any[]
    if (articles.length === 0) notFound()

    const [translations] = await connection.execute(
      'SELECT * FROM article_translations WHERE article_id = ?',
      [id],
    )

    const article = {
      ...articles[0],
      translations: (translations as any[]).map((t: any) => ({
        locale: t.locale,
        title: t.title,
        excerpt: t.excerpt,
        category: t.category,
        date_label: t.date_label,
        read_time: t.read_time,
        tags: typeof t.tags_json === 'string' ? JSON.parse(t.tags_json) : t.tags_json,
        highlights: typeof t.highlights_json === 'string' ? JSON.parse(t.highlights_json) : t.highlights_json,
        content: typeof t.content_json === 'string' ? JSON.parse(t.content_json) : t.content_json,
        meta_title: t.meta_title || '',
        meta_description: t.meta_description || '',
      })),
    }

    return (
      <div>
        <h1 className="apple-headline text-2xl text-text">Edit Article</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Editing: {article.slug}
        </p>
        <div className="mt-6">
          <ArticleEditor lang={lang} article={article} />
        </div>
      </div>
    )
  } finally {
    connection.release()
  }
}
