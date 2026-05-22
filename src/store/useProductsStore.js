import { create } from 'zustand'

export const useProductsStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
}))
