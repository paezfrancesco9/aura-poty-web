import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '../../store/useCartStore'
import toast from 'react-hot-toast'
import ProductDetailModal from './ProductDetailModal'

const genderBadge = {
  femenino: { label: 'Femenino', className: 'bg-pink-500/20 text-pink-200 text-xs px-2 py-0.5 rounded-full border border-pink-500/30' },
  masculino: { label: 'Masculino', className: 'bg-blue-500/20 text-blue-200 text-xs px-2 py-0.5 rounded-full border border-blue-500/30' },
  unisex: { label: 'Unisex', className: 'bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full border border-white/20' },
}

export default function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem)
  const variants = product.variants || []

  const [selectedVariant, setSelectedVariant] = useState(variants.length > 0 ? variants[0] : null)
  const [showDetail, setShowDetail] = useState(false)

  const displayImage = selectedVariant?.image_url || product.image_url
  const badge = genderBadge[product.gender] || genderBadge.unisex

  const handleSelectVariant = (e, variant) => {
    e.stopPropagation()
    setSelectedVariant(variant)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addItem(product, selectedVariant)
    const colorText = selectedVariant ? ` — ${selectedVariant.color_name}` : ''
    toast.success(`${product.name}${colorText} agregado`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #c9a874' },
      iconTheme: { primary: '#c9a874', secondary: '#1a1a1a' },
    })
  }

  return (
    <>
      <div className="bg-dark-700 border border-white/10 rounded-2xl overflow-hidden group hover:border-gold/40 transition-all duration-300 flex flex-col">

        {/* Image — click opens modal */}
        <div
          className="relative aspect-square bg-dark-600 overflow-hidden cursor-pointer shrink-0"
          onClick={() => setShowDetail(true)}
        >
          {displayImage ? (
            <img
              key={displayImage}
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
              {product.emoji || '✨'}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2">
            <span className={badge.className}>{badge.label}</span>
          </div>
          {product.category && (
            <div className="absolute top-2 right-2">
              <span className="bg-dark-900/70 text-white/60 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                {product.category}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
          {/* Name — click opens modal */}
          <div className="cursor-pointer" onClick={() => setShowDetail(true)}>
            <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-gold transition-colors">
              {selectedVariant?.title || product.name}
            </h3>
            {selectedVariant && !selectedVariant.title && (
              <p className="text-white/40 text-xs mt-0.5">{selectedVariant.color_name}</p>
            )}
            {product.brand && <p className="text-white/40 text-xs mt-0.5">{product.brand}</p>}
          </div>

          {/* Color swatches */}
          {variants.length > 0 && (
            <div className="flex gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
              {variants.slice(0, 8).map(v => {
                const isSelected = selectedVariant?.color_name === v.color_name
                return (
                  <button
                    key={v.id || v.color_name}
                    title={v.color_name}
                    onClick={(e) => handleSelectVariant(e, v)}
                    className={`w-6 h-6 rounded-md transition-all duration-150 ${
                      isSelected
                        ? 'ring-2 ring-gold ring-offset-1 ring-offset-dark-700 scale-110'
                        : 'ring-1 ring-white/20 hover:ring-white/50 hover:scale-105'
                    }`}
                    style={{ backgroundColor: v.color_hex }}
                  />
                )
              })}
              {variants.length > 8 && (
                <span className="text-white/30 text-xs self-center">+{variants.length - 8}</span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-1">
            <span className="text-gold font-bold text-base sm:text-lg leading-none">
              Gs. {product.price?.toLocaleString('es-PY')}
            </span>
            {/* Quick-view icon button */}
            <button
              onClick={() => setShowDetail(true)}
              className="text-white/30 hover:text-gold transition-colors p-1"
              title="Ver detalle"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>

          {/* Add to cart button — full width */}
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold border border-gold/30 hover:border-gold text-gold hover:text-dark-900 text-xs font-semibold py-2.5 rounded-xl transition-all duration-200 active:scale-95"
          >
            <ShoppingCart size={14} />
            Agregar al carrito
          </button>
        </div>
      </div>

      {showDetail && (
        <ProductDetailModal
          product={product}
          initialVariant={selectedVariant}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  )
}
