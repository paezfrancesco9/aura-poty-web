import { useState } from 'react'
import { X, Clock, ShoppingCart, Heart, Trash2 } from 'lucide-react'
import { useRecentlyViewedStore } from '../../store/useRecentlyViewedStore'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { useCartStore } from '../../store/useCartStore'
import toast from 'react-hot-toast'
import ProductDetailModal from './ProductDetailModal'

export default function RecentlyViewedPanel({ onClose }) {
  const products = useRecentlyViewedStore(s => s.products)
  const clear = useRecentlyViewedStore(s => s.clear)
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

  const handleToggleFav = (e, product) => {
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
              <Clock size={18} className="text-gold" />
              <span className="font-semibold text-white text-sm">Vistos recientemente</span>
            </div>
            <div className="flex items-center gap-2">
              {products.length > 0 && (
                <button
                  onClick={clear}
                  className="text-white/30 hover:text-white/70 transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  title="Limpiar historial"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white bg-white/5 hover:bg-white/15 rounded-full p-2 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-white/30 px-6 text-center">
                <Clock size={40} className="opacity-20" />
                <p className="text-sm">Todavía no visitaste ningún producto</p>
                <p className="text-xs opacity-70">Los productos que veas aparecerán acá</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {products.map(product => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onOpen={() => setSelected(product)}
                    onAddCart={handleAddCart}
                    onToggleFav={handleToggleFav}
                  />
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

function ProductRow({ product, onOpen, onAddCart, onToggleFav }) {
  const isFav = useFavoritesStore(s => s.isFavorite(product.id))

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
      onClick={onOpen}
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
          onClick={(e) => onToggleFav(e, product)}
          className={`p-1.5 rounded-lg transition-colors ${
            isFav ? 'text-rose-400' : 'text-white/30 hover:text-rose-400'
          }`}
          title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={(e) => onAddCart(e, product)}
          className="p-1.5 rounded-lg text-white/30 hover:text-gold transition-colors"
          title="Agregar al carrito"
        >
          <ShoppingCart size={14} />
        </button>
      </div>
    </div>
  )
}
