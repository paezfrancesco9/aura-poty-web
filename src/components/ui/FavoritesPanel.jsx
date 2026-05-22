import { useState } from 'react'
import { X, Heart, ShoppingCart } from 'lucide-react'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { useCartStore } from '../../store/useCartStore'
import toast from 'react-hot-toast'
import ProductDetailModal from './ProductDetailModal'

export default function FavoritesPanel({ onClose }) {
  const favorites = useFavoritesStore(s => s.favorites)
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite)
  const addItem = useCartStore(s => s.addItem)
  const [selected, setSelected] = useState(null)

  const handleAddCart = (e, product) => {
    e.stopPropagation()
    addItem(product, null)
    toast.success(`${product.name} agregado`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #c9a874' },
      iconTheme: { primary: '#c9a874', secondary: '#1a1a1a' },
    })
  }

  const handleRemove = (e, product) => {
    e.stopPropagation()
    toggleFavorite(product)
  }

  return (
    <>
      <div className="fixed inset-0 z-[60]">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div
          className="absolute top-0 right-0 w-full max-w-sm h-full bg-dark-800 border-l border-white/10 flex flex-col shadow-2xl"
          style={{ animation: 'slideLeft 0.25s cubic-bezier(0.34,1.1,0.64,1)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-rose-400" fill="currentColor" />
              <span className="font-semibold text-white text-sm">Mis favoritos</span>
              {favorites.length > 0 && (
                <span className="text-white/30 text-xs">({favorites.length})</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white bg-white/5 hover:bg-white/15 rounded-full p-2 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-white/30 px-6 text-center">
                <Heart size={40} className="opacity-20" />
                <p className="text-sm">Todavía no guardaste ningún favorito</p>
                <p className="text-xs opacity-70">
                  Tocá el ❤️ en cualquier producto para guardarlo acá
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {favorites.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelected(product)}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-dark-700 shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {product.emoji || '✨'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{product.name}</p>
                      {product.brand && <p className="text-white/30 text-xs mt-0.5">{product.brand}</p>}
                      <p className="text-gold text-sm font-bold mt-1">
                        Gs. {product.price?.toLocaleString('es-PY')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleRemove(e, product)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 transition-colors"
                        title="Quitar de favoritos"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                      <button
                        onClick={(e) => handleAddCart(e, product)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-gold transition-colors"
                        title="Agregar al carrito"
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <ProductDetailModal
          product={selected}
          initialVariant={null}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
