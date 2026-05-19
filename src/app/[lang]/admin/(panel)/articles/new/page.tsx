import ArticleEditor from '@/components/admin/ArticleEditor'

export default async function NewArticlePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return (
    <div>
      <h1 className="apple-headline text-2xl text-text">New Article</h1>
      <p className="mt-2 text-sm text-text-secondary">Create a new article in all languages</p>
      <div className="mt-6">
        <ArticleEditor lang={lang} />
      </div>
    </div>
  )
}
