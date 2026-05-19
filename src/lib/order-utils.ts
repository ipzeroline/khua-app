import thDict from '@/i18n/dictionaries/th'

export interface CheckoutItemInput {
  slug: string
  quantity: number
}

export interface ValidatedOrderItem {
  product_slug: string
  product_name: string
  product_name_en: string
  weight: string
  type: 'single' | 'bundle'
  unit_price: number
  quantity: number
  line_total: number
  shipping_total: number
}

const productsBySlug = new Map(thDict.products_data.map((product) => [product.slug, product]))

export function validateCheckoutItems(items: CheckoutItemInput[]): ValidatedOrderItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty')
  }

  return items.map((item) => {
    const product = productsBySlug.get(item.slug)
    const quantity = Number(item.quantity)

    if (!product) {
      throw new Error(`Invalid product: ${item.slug}`)
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error(`Invalid quantity for ${item.slug}`)
    }

    const unitPrice = Number(product.price)
    const lineTotal = unitPrice * quantity
    const productType = product.type || 'single'
    const shippingTotal = (productType === 'bundle' ? 100 : 30) * quantity

    return {
      product_slug: product.slug,
      product_name: product.name,
      product_name_en: product.nameEn,
      weight: product.weight,
      type: productType,
      unit_price: unitPrice,
      quantity,
      line_total: lineTotal,
      shipping_total: shippingTotal,
    }
  })
}

export function calculateShippingFee(items: ValidatedOrderItem[]) {
  return items.reduce((sum, item) => sum + item.shipping_total, 0)
}

export function createOrderNumber() {
  const stamp = new Date()
    .toISOString()
    .replace(/\D/g, '')
    .slice(0, 14)
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `KHUA-${stamp}-${suffix}`
}
