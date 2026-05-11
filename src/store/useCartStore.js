import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      container: null,

      setContainer: (container) => set({ container }),

      addItem: (product) => {
        const items = get().items
        const existing = items.find(i => i.id === product.id)
        if (existing) {
          set({
            items: items.map(i =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter(i => i.id !== id) })
          return
        }
        set({
          items: get().items.map(i =>
            i.id === id ? { ...i, quantity } : i
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
