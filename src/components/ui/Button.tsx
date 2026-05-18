'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: 'gold' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  external?: boolean
}

export default function Button({
  href,
  onClick,
  children,
  variant = 'gold',
  size = 'md',
  className,
  external,
}: ButtonProps) {
  const baseClasses =
    'premium-button inline-flex items-center justify-center font-medium tracking-wider text-xs transition-all duration-500 rounded-full'

  const variants = {
    gold: 'bg-gold text-white hover:bg-gold-light shadow-[0_12px_34px_rgba(184,134,11,0.22)] hover:shadow-[0_16px_42px_rgba(184,134,11,0.28)]',
    outline:
      'border border-gold/30 bg-white/40 text-gold hover:bg-gold/5 hover:border-gold shadow-[0_10px_30px_rgba(29,29,31,0.04)]',
    ghost: 'text-gold hover:text-gold-light',
  }

  const sizes = {
    sm: 'px-5 py-2 text-[0.65rem]',
    md: 'px-8 py-3 text-xs',
    lg: 'px-10 py-4 text-sm',
  }

  const classes = cn(baseClasses, variants[variant], sizes[size], className)

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.3 },
  }

  if (href) {
    if (external) {
      return (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...motionProps}
        >
          {children}
        </motion.a>
      )
    }
    return (
      <motion.div {...motionProps}>
        <Link href={href} className={classes}>
          {children}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button onClick={onClick} className={classes} {...motionProps}>
      {children}
    </motion.button>
  )
}
