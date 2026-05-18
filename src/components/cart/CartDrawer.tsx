'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Dictionary, Locale } from '@/i18n'
import { useCart } from './CartProvider'

interface CartDrawerProps {
  dict: Dictionary
  lang: Locale
}

export default function CartDrawer({ dict, lang }: CartDrawerProps) {
  const [open, setOpen] = useState(false)
  const { items, totalItems, subtotal, updateQuantity, removeItem } = useCart()
  const lineText = encodeURIComponent(
    [
      'KHUA order',
      ...items.map((item) => `${item.name} x ${item.quantity}`),
      `${dict.cart.subtotal}: ${dict.cart.currency}${subtotal}`,
    ].join('\n'),
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="premium-link relative text-[0.8rem] text-text-secondary transition-colors hover:text-text"
        aria-label={dict.cart.open}
      >
        {dict.cart.title}
        {totalItems > 0 && (
          <span className="absolute -right-4 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
            {totalItems}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label={dict.cart.close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-md flex-col bg-surface shadow-[0_0_80px_rgba(29,29,31,0.18)]"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div>
                  <p className="apple-eyebrow text-xs uppercase text-gold/70">
                    {totalItems} {dict.cart.items}
                  </p>
                  <h2 className="apple-headline mt-1 text-2xl text-text">
                    {dict.cart.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text"
                >
                  {dict.cart.close}
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                  <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-gold-pale text-2xl">
                    🛒
                  </div>
                  <h3 className="apple-headline text-2xl text-text">{dict.cart.empty}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {dict.cart.emptyDesc}
                  </p>
                  <Link
                    href={`/${lang}/products`}
                    onClick={() => setOpen(false)}
                    className="premium-button mt-8 rounded-full bg-gold px-7 py-3 text-sm font-medium text-white"
                  >
                    {dict.cart.continueShopping}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                    {items.map((item) => (
                      <div key={item.slug} className="rounded-2xl border border-border bg-white/70 p-4">
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="apple-headline text-base text-text">{item.name}</h3>
                            <p className="mt-1 text-xs text-text-secondary">{item.weight}</p>
                          </div>
                          <p className="font-medium text-gold">
                            {dict.cart.currency}{item.price * item.quantity}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-border bg-surface">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                              aria-label={dict.cart.decrease}
                              className="px-3 py-1.5 text-text-secondary"
                            >
                              -
                            </button>
                            <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                              aria-label={dict.cart.increase}
                              className="px-3 py-1.5 text-text-secondary"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.slug)}
                            className="text-xs font-medium text-text-secondary transition-colors hover:text-gold"
                          >
                            {dict.cart.remove}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-text-secondary">{dict.cart.subtotal}</span>
                      <span className="apple-headline text-2xl text-text">
                        {dict.cart.currency}{subtotal}
                      </span>
                    </div>
                    <a
                      href={`${dict.social.line}?text=${lineText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="premium-button flex w-full items-center justify-center rounded-full bg-gold px-8 py-4 text-sm font-medium text-white"
                    >
                      {dict.cart.checkout}
                    </a>
                  </div>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
