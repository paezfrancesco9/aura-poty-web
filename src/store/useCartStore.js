import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const getKey = (item) => item.cartKey || String(item.id)

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      container: null,

      setContainer: (container) => set({ container }),

      addItem: (product, variant = null) => {
        const variantId = variant ? (variant.id || variant.color_name) : 'default'
        const cartKey = `${product.id}_${variantId}`
        const items = get().items
        const existing = items.find(i => getKey(i) === cartKey)
        if (existing) {
          set({
            items: items.map(i =>
              getKey(i) === cartKey ? { ...i, quantity: i.quantity + 1 } : i
            )
          })
        } else {
          set({
            items: [...items, {
              ...product,
              cartKey,
              image_url: variant?.image_url || product.image_url,
              color_name: variant?.color_name || null,
              color_hex: variant?.color_hex || null,
              variant_title: variant?.title || null,
              quantity: 1,
            }]
          })
        }
      },

      removeItem: (cartKey) => {
        set({ items: get().items.filter(i => getKey(i) !== cartKey) })
      },

      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter(i => getKey(i) !== cartKey) })
          return
        }
        set({
          items: get().items.map(i =>
            getKey(i) === cartKey ? { ...i, quantity } : i
          )
        })
      },

      clearCart: () => set({ items: [], container: null }),

      total: () => {
        const itemsTotal = get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
        return itemsTotal + (get().container?.price || 0)
      },

      count: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    { name: 'aura-poty-cart' }
  )
)
