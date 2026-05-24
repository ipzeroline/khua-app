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

const likeActionLabels: Record<Locale, string> = {
  th: 'ถูกใจ',
  en: 'Like',
  lo: 'ຖືກໃຈ',
  zh: '赞',
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
      ui?: (params: {
        method: string
        href: string
        quote?: string
        hashtag?: string
      }) => void
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
    if (window.FB?.ui) {
      window.FB.ui({
        method: 'share',
        href: articleUrl,
        quote: article.excerpt,
        hashtag: '#KHUA',
      })
    } else {
      window.open(facebookShareUrl, '_blank', 'noopener,noreferrer')
    }
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
        onLoad={() => {
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
        <div className="relative left-[calc((100%-100vw)/2)] ml-0 mr-auto mt-8 inline-flex w-[calc(100vw-3rem)] max-w-xs flex-col items-center justify-center gap-2 rounded-[1.75rem] border border-white/80 bg-white/70 p-1.5 shadow-[0_18px_50px_rgba(29,29,31,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-gold/10 backdrop-blur-xl sm:left-auto sm:mx-auto sm:w-auto sm:max-w-full sm:flex-row sm:rounded-[2rem] sm:gap-3">
          <button
            type="button"
            onClick={handleShare}
            aria-label={shareLabels[lang]}
            className="premium-button inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full border border-[#1877f2]/25 bg-[linear-gradient(135deg,#1877f2_0%,#0f5fd0_52%,#0b4ca8_100%)] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(24,119,242,0.22),inset_0_1px_0_rgba(255,255,255,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(24,119,242,0.28),inset_0_1px_0_rgba(255,255,255,0.34)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877f2]/35 focus-visible:ring-offset-2 sm:w-auto"
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold leading-none text-[#1877f2] shadow-[inset_0_-1px_0_rgba(29,29,31,0.08)]">
              f
            </span>
            {shareLabels[lang]}
          </button>
          <div className="flex min-h-12 w-full min-w-28 items-center justify-center gap-2 rounded-full border border-gold/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,243,223,0.58))] px-4 text-sm font-semibold text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_22px_rgba(168,120,36,0.08)] sm:w-auto">
            <span className="sr-only">{likeLabels[lang]}</span>
            <span aria-hidden="true" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1877f2]/10 text-xs font-bold text-[#1877f2]">
              f
            </span>
            <span aria-hidden="true">{likeActionLabels[lang]}</span>
            <div
              className="fb-like"
              data-href={articleUrl}
              data-width=""
              data-layout="button_count"
              data-action="like"
              data-size="large"
              data-share="false"
            />
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
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-medium text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mb-8 grid gap-3 border-b border-border pb-8 sm:grid-cols-3">
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
