'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Dictionary, Locale } from '@/i18n'
import { useCart } from './CartProvider'

interface CartDrawerProps {
  dict: Dictionary
  lang: Locale
}

interface CompletedOrder {
  id: number
  order_number: string
  total: number
}

const paymentInfo = {
  bankName: process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME || 'กรุณาตั้งค่าธนาคาร',
  accountNumber: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER || '000-0-00000-0',
  accountName: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME || 'KHUA',
  qrUrl: process.env.NEXT_PUBLIC_PAYMENT_QR_URL || '/khua-payment-qr.svg',
}

export default function CartDrawer({ dict, lang }: CartDrawerProps) {
  const [open, setOpen] = useState(false)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [note, setNote] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null)
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [slipSubmitted, setSlipSubmitted] = useState(false)
  const [uploadingSlip, setUploadingSlip] = useState(false)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const { items, totalItems, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const shipping = items.reduce((sum, item) => {
    const unitShipping = item.type === 'bundle' ? 100 : 30
    return sum + unitShipping * item.quantity
  }, 0)
  const total = subtotal + shipping

  useEffect(() => {
    if (!open) return

    Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/account/addresses'),
    ]).then(async ([meRes, addressRes]) => {
      setAuthenticated(meRes.ok)
      if (addressRes.ok) {
        const data = await addressRes.json()
        const loadedAddresses = data.addresses || []
        setAddresses(loadedAddresses)
        const defaultAddress = loadedAddresses.find((address: any) => address.is_default)
        setSelectedAddressId(String((defaultAddress || loadedAddresses[0])?.id || ''))
      } else {
        setAddresses([])
        setSelectedAddressId('')
      }
    })
  }, [open])

  const placeOrder = async () => {
    setCheckoutError('')
    setCheckoutMessage('')

    if (!authenticated) {
      setCheckoutError(dict.cart.checkoutLoginRequired)
      return
    }

    if (!selectedAddressId) {
      setCheckoutError(dict.cart.checkoutAddressRequired)
      return
    }

    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_id: selectedAddressId,
          customer_note: note,
          items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')

      setCompletedOrder({
        id: data.order.id,
        order_number: data.order.order_number,
        total: data.order.total,
      })
      clearCart()
      setNote('')
      setCheckoutMessage(`${dict.cart.orderCreated}: ${data.order.order_number}`)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  const uploadSlip = async () => {
    if (!completedOrder || !slipFile) return

    setCheckoutError('')
    setCheckoutMessage('')
    setUploadingSlip(true)

    try {
      const formData = new FormData()
      formData.append('slip', slipFile)

      const res = await fetch(`/api/orders/${completedOrder.id}/payment-slip`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setSlipFile(null)
      setSlipSubmitted(true)
      setCheckoutMessage(dict.cart.slipUploaded)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploadingSlip(false)
    }
  }

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

              {completedOrder ? (
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {slipSubmitted ? (
                    <div className="flex min-h-full items-center">
                      <div className="w-full overflow-hidden rounded-[1.7rem] border border-gold/20 bg-[linear-gradient(145deg,#2a1a12,#15100c)] text-center text-white shadow-[0_26px_90px_rgba(33,21,15,0.24)]">
                        <div className="px-6 py-10">
                          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/15 text-2xl text-gold-light">
                            ✓
                          </div>
                          <p className="apple-eyebrow text-xs uppercase text-gold-light">
                            KHUA
                          </p>
                          <h3 className="apple-headline mt-3 text-3xl leading-tight">
                            {dict.cart.thankYouTitle}
                          </h3>
                          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/70">
                            {dict.cart.thankYouMessage}
                          </p>
                          <p className="mt-5 rounded-2xl bg-white/8 px-4 py-3 text-sm text-gold-light">
                            {completedOrder.order_number}
                          </p>
                          <Link
                            href={`/${lang}/products`}
                            onClick={() => {
                              setOpen(false)
                              setCompletedOrder(null)
                              setSlipSubmitted(false)
                            }}
                            className="premium-button mt-8 flex w-full items-center justify-center rounded-full bg-gold px-8 py-4 text-sm font-medium text-white"
                          >
                            {dict.cart.backToProducts}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                  <div className="overflow-hidden rounded-[1.7rem] border border-gold/20 bg-[linear-gradient(145deg,#2a1a12,#15100c)] text-white shadow-[0_26px_90px_rgba(33,21,15,0.24)]">
                    <div className="border-b border-white/10 px-5 py-5">
                      <p className="apple-eyebrow text-xs uppercase text-gold-light">
                        {dict.cart.orderCreated}
                      </p>
                      <h3 className="apple-headline mt-2 text-2xl">
                        {dict.cart.paymentTitle}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/68">
                        {dict.cart.paymentSubtitle}
                      </p>
                    </div>

                    <div className="grid gap-5 p-5">
                      <div className="rounded-2xl bg-white p-4 text-[#21150f]">
                        <div className="mx-auto max-w-[220px] rounded-xl border border-gold/20 bg-white p-3">
                          <img
                            src={paymentInfo.qrUrl}
                            alt={dict.cart.qrCode}
                            className="aspect-square w-full object-contain"
                          />
                        </div>
                        <p className="mt-3 text-center text-xs font-semibold uppercase text-gold">
                          {dict.cart.qrCode}
                        </p>
                      </div>

                      <div className="space-y-3 rounded-2xl bg-white/8 p-4 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-white/56">{dict.account.orderNumber}</span>
                          <span className="text-right font-medium">{completedOrder.order_number}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-white/56">{dict.cart.bankName}</span>
                          <span className="text-right font-medium">{paymentInfo.bankName}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-white/56">{dict.cart.accountNumber}</span>
                          <span className="text-right font-medium tracking-wide">
                            {paymentInfo.accountNumber}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-white/56">{dict.cart.accountName}</span>
                          <span className="text-right font-medium">{paymentInfo.accountName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                          <span className="text-white/56">{dict.cart.transferAmount}</span>
                          <span className="apple-headline text-2xl text-gold-light">
                            {dict.cart.currency}
                            {completedOrder.total.toLocaleString(dict.locale)}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                        <label className="block text-sm font-semibold">
                          {dict.cart.uploadSlip}
                        </label>
                        <p className="mt-1 text-xs text-white/55">{dict.cart.slipHelp}</p>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(event) => setSlipFile(event.target.files?.[0] || null)}
                          className="mt-4 w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                        />
                        <button
                          type="button"
                          onClick={uploadSlip}
                          disabled={!slipFile || uploadingSlip}
                          className="premium-button mt-4 flex w-full items-center justify-center rounded-full bg-gold px-8 py-4 text-sm font-medium text-white disabled:opacity-50"
                        >
                          {uploadingSlip ? '...' : dict.cart.uploadSlip}
                        </button>
                      </div>

                      {checkoutError && (
                        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                          {checkoutError}
                        </p>
                      )}
                      {checkoutMessage && (
                        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
                          {checkoutMessage}
                        </p>
                      )}

                      <Link
                        href={`/${lang}/products`}
                        onClick={() => {
                          setOpen(false)
                          setCompletedOrder(null)
                          setSlipSubmitted(false)
                        }}
                        className="flex items-center justify-center rounded-full border border-white/14 px-7 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                      >
                        {dict.cart.backToProducts}
                      </Link>
                    </div>
                  </div>
                  )}
                </div>
              ) : items.length === 0 ? (
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
                    <div className="mb-5 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">{dict.cart.subtotal}</span>
                        <span className="font-medium text-text">
                          {dict.cart.currency}{subtotal}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">{dict.cart.shipping}</span>
                        <span className="font-medium text-text">
                          {dict.cart.currency}{shipping}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className="text-text-secondary">{dict.cart.total}</span>
                        <span className="apple-headline text-2xl text-text">
                          {dict.cart.currency}{total}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="apple-eyebrow text-xs uppercase text-gold/70">
                        {dict.cart.checkoutTitle}
                      </p>
                      {authenticated === false ? (
                        <Link
                          href={`/${lang}/account`}
                          onClick={() => setOpen(false)}
                          className="block rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-text-secondary"
                        >
                          {dict.cart.checkoutLoginRequired}
                        </Link>
                      ) : addresses.length === 0 ? (
                        <Link
                          href={`/${lang}/account`}
                          onClick={() => setOpen(false)}
                          className="block rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-text-secondary"
                        >
                          {dict.cart.checkoutAddressRequired}
                        </Link>
                      ) : (
                        <>
                          <select
                            value={selectedAddressId}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                            className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none focus:border-gold/50"
                          >
                            {addresses.map((address) => (
                              <option key={address.id} value={address.id}>
                                {address.recipient_name} - {address.province}
                              </option>
                            ))}
                          </select>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            placeholder={dict.cart.note}
                            className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none focus:border-gold/50"
                          />
                          <button
                            type="button"
                            onClick={placeOrder}
                            disabled={checkingOut}
                            className="premium-button flex w-full items-center justify-center rounded-full bg-gold px-8 py-4 text-sm font-medium text-white disabled:opacity-50"
                          >
                            {checkingOut ? '...' : dict.cart.placeOrder}
                          </button>
                        </>
                      )}
                      {checkoutError && (
                        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                          {checkoutError}
                        </p>
                      )}
                      {checkoutMessage && (
                        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
                          {checkoutMessage}
                        </p>
                      )}
                    </div>
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
