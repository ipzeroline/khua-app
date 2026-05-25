'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { motion } from 'framer-motion'
import { ArticleData, Dictionary, Locale } from '@/i18n'

interface ArticleDetailContentProps {
  article: ArticleData
  dict: Dictionary
  lang: Locale
  articleUrl: string
}

const shareLabels: Record<Locale, string> = {
  th: 'แชร์ไป Facebook',
  en: 'Share on Facebook',
  lo: 'ແຊຣ໌ໄປ Facebook',
  zh: '分享到 Facebook',
}

const likeLabels: Record<Locale, string> = {
  th: 'ถูกใจบทความนี้',
  en: 'Like this article',
  lo: 'ກົດຖືກໃຈບົດຄວາມນີ້',
  zh: '赞这篇文章',
}

const facebookSdkLocales: Record<Locale, string> = {
  th: 'th_TH',
  en: 'en_US',
  lo: 'lo_LA',
  zh: 'zh_CN',
}

const FACEBOOK_APP_ID = '2052165095332670'

declare global {
  interface Window {
    FB?: {
      XFBML?: {
        parse: () => void
      }
    }
  }
}

function renderContentBlock(block: string, index: number) {
  const trimmed = block.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('## ')) {
    return (
      <h3 key={`${index}-${trimmed}`} className="text-xl font-semibold leading-snug text-text">
        {trimmed.replace(/^##\s+/, '')}
      </h3>
    )
  }

  if (trimmed.startsWith('# ')) {
    return (
      <h2 key={`${index}-${trimmed}`} className="pt-4 text-3xl font-semibold leading-snug text-text">
        {trimmed.replace(/^#\s+/, '')}
      </h2>
    )
  }

  const imageMatch = trimmed.match(/^!\[(.*)]\((.*)\)$/)
  if (imageMatch) {
    const [, alt, src] = imageMatch
    return (
      <figure key={`${index}-${trimmed}`} className="overflow-hidden rounded-2xl bg-gold-pale">
        <div className="relative aspect-[16/9]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      </figure>
    )
  }

  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length > 0 && lines.every((line) => line.startsWith('* '))) {
    return (
      <ul key={`${index}-${trimmed}`} className="space-y-2 rounded-2xl border border-border bg-white/45 p-5">
        {lines.map((line) => (
          <li key={line} className="flex gap-3">
            <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
            <span>{line.replace(/^\*\s+/, '')}</span>
          </li>
        ))}
      </ul>
    )
  }

  return <p key={`${index}-${trimmed}`}>{trimmed}</p>
}

export default function ArticleDetailContent({
  article,
  dict,
  lang,
  articleUrl,
}: ArticleDetailContentProps) {
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`
  const facebookSdkUrl = `https://connect.facebook.net/${facebookSdkLocales[lang]}/sdk.js#xfbml=1&version=v22.0&appId=${FACEBOOK_APP_ID}`

  const handleShare = () => {
    window.open(facebookShareUrl, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    if (window.FB?.XFBML) {
      window.FB.XFBML.parse()
    }
  }, [articleUrl])

  return (
    <article className="pt-32 pb-24 px-6">
      <div id="fb-root" />
      <Script
        id="facebook-jssdk"
        src={facebookSdkUrl}
        strategy="afterInteractive"
        crossOrigin="anonymous"
        onReady={() => {
          if (window.FB?.XFBML) {
            window.FB.XFBML.parse()
          }
        }}
      />
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-3xl text-center"
      >
        <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
          {article.category}
        </p>
        <h1 className="apple-headline break-words text-4xl text-text sm:text-5xl">
          {article.title}
        </h1>
        <p className="mt-5 text-sm text-text-secondary">
          {article.date} · {article.readTime}
        </p>
        <div className="mt-5 flex items-center justify-center">
          <div className="inline-flex h-9 flex-nowrap items-center gap-1.5 rounded-full border border-white/80 bg-white/70 p-1 shadow-[0_12px_32px_rgba(29,29,31,0.07),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-gold/10 backdrop-blur-xl">
            <button
              type="button"
              onClick={handleShare}
              aria-label={shareLabels[lang]}
              title={shareLabels[lang]}
              className="inline-flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-full text-text-secondary transition hover:bg-gold/10 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/25 focus-visible:ring-offset-2"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                <path d="M16 6l-4-4-4 4" />
                <path d="M12 2v14" />
              </svg>
            </button>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <div className="flex h-7 min-w-[104px] flex-none items-center justify-center rounded-full bg-white px-1.5">
              <span className="sr-only">{likeLabels[lang]}</span>
              <div
                className="fb-like leading-none"
                data-href={articleUrl}
                data-width="104"
                data-layout="button_count"
                data-action="like"
                data-size="small"
                data-share="false"
              />
            </div>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-white/70 bg-surface"
      >
        {article.coverImage ? (
          <div className="relative aspect-[16/9] bg-gold-pale">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover object-center"
            />
          </div>
        ) : null}
        <div className="p-6 sm:p-10">
          <div className="mb-8 flex flex-wrap justify-center gap-2 border-b border-border pb-6 sm:justify-start">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-medium text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            {article.highlights.map((highlight) => (
              <p
                key={highlight}
                className="rounded-xl border border-border bg-white/45 p-4 text-sm leading-relaxed text-text-secondary"
              >
                {highlight}
              </p>
            ))}
          </div>
          <div className="space-y-6 text-base leading-8 text-text-secondary">
            {article.content.map(renderContentBlock)}
          </div>
          <Link
            href={`/${lang}/articles`}
            className="premium-link mt-10 inline-flex text-sm font-medium text-gold"
          >
            {dict.articles.backToArticles}
          </Link>
        </div>
      </motion.div>
    </article>
  )
}
