import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (product) => {
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
        const exists = get().favorites.some(p => p.id === product.id)
        if (exists) {
          set({ favorites: get().favorites.filter(p => p.id !== product.id) })
        } else {
          set({ favorites: [simplified, ...get().favorites] })
        }
      },

      isFavorite: (productId) => get().favorites.some(p => p.id === productId),

      count: () => get().favorites.length,
    }),
    { name: 'aura-poty-favorites' }
  )
)
