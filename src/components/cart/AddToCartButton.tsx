'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dictionary, ProductData } from '@/i18n'
import { useCart } from './CartProvider'

interface AddToCartButtonProps {
  product: ProductData
  dict: Dictionary
  size?: 'sm' | 'lg'
}

export default function AddToCartButton({
  product,
  dict,
  size = 'lg',
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1300)
  }

  return (
    <motion.button
      type="button"
      onClick={handleAdd}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`premium-button inline-flex items-center justify-center rounded-full bg-gold text-white font-medium tracking-wide shadow-[0_12px_34px_rgba(184,134,11,0.22)] transition-all duration-500 hover:bg-gold-light ${
        size === 'sm' ? 'px-5 py-2 text-xs' : 'px-10 py-4 text-sm'
      }`}
    >
      {added ? dict.products.addedToCart : dict.products.addToCart}
    </motion.button>
  )
}
