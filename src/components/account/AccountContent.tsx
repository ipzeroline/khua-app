'use client'

import { FormEvent, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Dictionary } from '@/i18n'

interface MemberProfile {
  name: string
  email: string
  phone: string
  memberSince: string
}

interface AccountContentProps {
  dict: Dictionary
}

const STORAGE_KEY = 'khua-member'

function loadProfile(): MemberProfile | null {
  if (typeof window === 'undefined') return null
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved ? (JSON.parse(saved) as MemberProfile) : null
}

export default function AccountContent({ dict }: AccountContentProps) {
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [mode, setMode] = useState<'signin' | 'register'>('register')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })

  useEffect(() => {
    const saved = loadProfile()
    setProfile(saved)
    setForm({
      name: saved?.name || '',
      email: saved?.email || '',
      phone: saved?.phone || '',
      password: '',
    })
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextProfile: MemberProfile = {
      name: form.name || form.email.split('@')[0] || 'KHUA Member',
      email: form.email,
      phone: form.phone,
      memberSince: profile?.memberSince || new Date().toLocaleDateString(dict.locale),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile))
    setProfile(nextProfile)
  }

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setProfile(null)
    setForm({ name: '', email: '', phone: '', password: '' })
  }

  return (
    <div className="pt-32 pb-24 px-6">
      <section className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.account.label}
          </p>
          <h1 className="apple-headline text-4xl text-text sm:text-5xl">
            {dict.account.title}
          </h1>
          <p className="apple-subheadline mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
            {dict.account.subtitle}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card rounded-2xl border border-white/70 bg-surface p-6 sm:p-8"
          >
            {profile ? (
              <div>
                <p className="apple-eyebrow text-xs uppercase text-gold/70">
                  {dict.account.welcome}
                </p>
                <h2 className="apple-headline mt-2 text-3xl text-text">{profile.name}</h2>
                <div className="mt-6 space-y-3 text-sm text-text-secondary">
                  <p>{profile.email}</p>
                  <p>{profile.phone}</p>
                  <p>
                    {dict.account.memberSince}: {profile.memberSince}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="premium-button mt-8 rounded-full border border-gold/30 px-7 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/5"
                >
                  {dict.account.logout}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6 flex rounded-full border border-border bg-bg p-1">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      mode === 'register' ? 'bg-surface text-text shadow-sm' : 'text-text-secondary'
                    }`}
                  >
                    {dict.account.register}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      mode === 'signin' ? 'bg-surface text-text shadow-sm' : 'text-text-secondary'
                    }`}
                  >
                    {dict.account.signIn}
                  </button>
                </div>

                <div className="space-y-4">
                  {mode === 'register' && (
                    <input
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder={dict.account.name}
                      className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                    />
                  )}
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder={dict.account.email}
                    className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                  />
                  {mode === 'register' && (
                    <input
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      placeholder={dict.account.phone}
                      className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                    />
                  )}
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder={dict.account.password}
                    className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                  />
                </div>

                <button
                  type="submit"
                  className="premium-button mt-6 w-full rounded-full bg-gold px-8 py-4 text-sm font-medium text-white"
                >
                  {mode === 'register' ? dict.account.register : dict.account.signIn}
                </button>
              </form>
            )}
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="rounded-2xl border border-border bg-surface/80 p-6"
            >
              <h2 className="apple-headline text-xl text-text">{dict.account.benefitsTitle}</h2>
              <ul className="mt-5 space-y-4">
                {dict.account.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-border bg-surface/80 p-6"
            >
              <h2 className="apple-headline text-xl text-text">{dict.account.ordersTitle}</h2>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {dict.account.noOrders}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
