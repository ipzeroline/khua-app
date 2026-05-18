'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ProductData } from '@/i18n'

export interface CartItem {
  slug: string
  name: string
  nameEn: string
  price: number
  weight: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  subtotal: number
  addItem: (product: ProductData) => void
  updateQuantity: (slug: string, quantity: number) => void
  removeItem: (slug: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)
const STORAGE_KEY = 'khua-cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved ? (JSON.parse(saved) as CartItem[]) : []
}

function toCartItem(product: ProductData): CartItem {
  return {
    slug: product.slug,
    name: product.name,
    nameEn: product.nameEn,
    price: Number(product.price),
    weight: product.weight,
    quantity: 1,
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return {
      items,
      totalItems,
      subtotal,
      addItem: (product) => {
        setItems((current) => {
          const existing = current.find((item) => item.slug === product.slug)
          if (existing) {
            return current.map((item) =>
              item.slug === product.slug
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          }
          return [...current, toCartItem(product)]
        })
      },
      updateQuantity: (slug, quantity) => {
        setItems((current) =>
          current
            .map((item) => (item.slug === slug ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        )
      },
      removeItem: (slug) => {
        setItems((current) => current.filter((item) => item.slug !== slug))
      },
      clearCart: () => setItems([]),
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
