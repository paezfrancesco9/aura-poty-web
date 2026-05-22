import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        const simplified = {
          id: product.id,
          name: product.name,
          brand: product.brand || null,
          price: product.price,
          image_url: product.image_url || null,
          emoji: product.emoji || null,
          gender: product.gender || null,
          category: product.category || null,
          variants: product.variants || [],
          description: product.description || null,
        }
        const filtered = get().products.filter(p => p.id !== product.id)
        set({ products: [simplified, ...filtered].slice(0, 10) })
      },

      clear: () => set({ products: [] }),
    }),
    { name: 'aura-poty-recent' }
  )
)
