import { X, ShoppingCart, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '../../store/useCartStore'
import toast from 'react-hot-toast'

const genderBadge = {
  femenino: { label: 'Femenino', className: 'bg-pink-500/20 text-pink-200 text-xs px-2.5 py-1 rounded-full border border-pink-500/30' },
  masculino: { label: 'Masculino', className: 'bg-blue-500/20 text-blue-200 text-xs px-2.5 py-1 rounded-full border border-blue-500/30' },
  unisex: { label: 'Unisex', className: 'bg-white/10 text-white/70 text-xs px-2.5 py-1 rounded-full border border-white/20' },
}

export default function ProductDetailModal({ product, initialVariant, onClose }) {
  const addItem = useCartStore(s => s.addItem)
  const variants = product.variants || []
  const hasMainImage = !!product.image_url
  // null = imagen principal del producto
  const [selectedVariant, setSelectedVariant] = useState(initialVariant ?? null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const totalColorOptions = variants.length + (hasMainImage && variants.length > 0 ? 1 : 0)
  const showSwatches = totalColorOptions >= 2

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const currentImage = selectedVariant?.image_url || product.image_url
  const badge = genderBadge[product.gender] || genderBadge.unisex

  const handleSelectVariant = (v) => {
    setImgLoaded(false)
    setSelectedVariant(v)
  }

  const handleAdd = () => {
    addItem(product, selectedVariant)
    const colorText = selectedVariant ? ` — ${selectedVariant.color_name}` : ''
    toast.success(`${product.name}${colorText} agregado`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #c9a874' },
      iconTheme: { primary: '#c9a874', secondary: '#1a1a1a' },
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-6"
      onClick={onClose}
    >
      {/* Modal container */}
      <div
        className="bg-dark-800 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        style={{ animation: 'slideUp 0.28s cubic-bezier(0.34,1.1,0.64,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 sm:px-7 sm:pt-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className={badge.className}>{badge.label}</span>
            {product.category && (
              <span className="bg-dark-600 text-white/40 text-xs px-2.5 py-1 rounded-full">
                {product.category}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white bg-white/5 hover:bg-white/15 rounded-full p-2 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-0 h-full">

            {/* ── Image panel ── */}
            <div className="relative bg-dark-700 sm:min-h-[480px]">
              <div className="aspect-square sm:aspect-auto sm:h-full sm:min-h-[480px] overflow-hidden">
                {currentImage ? (
                  <img
                    key={currentImage}
                    src={currentImage}
                    alt={selectedVariant?.color_name || product.name}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl bg-dark-700">
                    {product.emoji || '✨'}
                  </div>
                )}
                {/* Loading placeholder */}
                {!imgLoaded && currentImage && (
                  <div className="absolute inset-0 bg-dark-700 animate-pulse" />
                )}
              </div>

              {/* Thumbnail strip mobile */}
              {showSwatches && (
                <div className="sm:hidden absolute bottom-0 inset-x-0 flex gap-2 p-3 bg-gradient-to-t from-black/60 to-transparent overflow-x-auto scrollbar-hide">
                  {/* Miniatura imagen principal */}
                  {hasMainImage && variants.length > 0 && (
                    <button
                      onClick={() => { setImgLoaded(false); setSelectedVariant(null) }}
                      className={`shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedVariant === null ? 'border-gold scale-105' : 'border-white/20 opacity-70'
                      }`}
                    >
                      <img src={product.image_url} alt="Principal" className="w-full h-full object-cover" />
                    </button>
                  )}
                  {variants.map(v => (
                    <button
                      key={v.id || v.color_name}
                      onClick={() => handleSelectVariant(v)}
                      className={`shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedVariant?.color_name === v.color_name
                          ? 'border-gold scale-105'
                          : 'border-white/20 opacity-70'
                      }`}
                    >
                      {v.image_url ? (
                        <img src={v.image_url} alt={v.color_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: v.color_hex }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info panel ── */}
            <div className="flex flex-col p-5 sm:p-7 sm:overflow-y-auto gap-4">
              {/* Name & brand */}
              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-white font-light tracking-wide leading-tight">
                  {selectedVariant?.title || product.name}
                </h2>
                {selectedVariant && !selectedVariant.title && (
                  <p className="text-gold/70 text-sm mt-0.5">{selectedVariant.color_name}</p>
                )}
                {product.brand && (
                  <p className="text-white/40 text-sm mt-1">{product.brand}</p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
                  {product.description}
                </p>
              )}

              {/* ── Color variants ── */}
              {showSwatches && (
                <div className="border-t border-white/5 pt-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                    Color:{' '}
                    <span className="text-white/80 normal-case tracking-normal font-medium">
                      {selectedVariant?.color_name || 'Principal'}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {/* Opción: imagen principal */}
                    {hasMainImage && variants.length > 0 && (
                      <button
                        onClick={() => { setImgLoaded(false); setSelectedVariant(null) }}
                        className={`relative flex flex-col items-center gap-1.5 transition-all duration-200 ${
                          selectedVariant === null ? 'scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedVariant === null ? 'border-gold shadow-lg shadow-gold/20' : 'border-white/15'
                        }`}>
                          <img src={product.image_url} alt="Principal" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-xs leading-none ${selectedVariant === null ? 'text-gold font-medium' : 'text-white/40'}`}>
                          Principal
                        </span>
                      </button>
                    )}

                    {/* Variantes de color */}
                    {variants.map(v => {
                      const isSelected = selectedVariant?.color_name === v.color_name
                      return (
                        <button
                          key={v.id || v.color_name}
                          onClick={() => handleSelectVariant(v)}
                          title={v.color_name}
                          className={`relative flex flex-col items-center gap-1.5 transition-all duration-200 ${
                            isSelected ? 'scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected ? 'border-gold shadow-lg shadow-gold/20' : 'border-white/15'
                          }`}>
                            {v.image_url ? (
                              <img src={v.image_url} alt={v.color_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: v.color_hex }}>
                                {isSelected && <Check size={18} className="text-white drop-shadow-md" />}
                              </div>
                            )}
                          </div>
                          <span className={`text-xs leading-none ${isSelected ? 'text-gold font-medium' : 'text-white/40'}`}>
                            {v.color_name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* ── Price + Add to cart ── */}
              <div className="border-t border-white/5 pt-4 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Precio</p>
                    <span className="text-gold font-bold text-3xl">
                      Gs. {product.price?.toLocaleString('es-PY')}
                    </span>
                  </div>
                  {selectedVariant && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20"
                        style={{ backgroundColor: selectedVariant.color_hex }}
                      />
                      <span className="text-white/50 text-sm">{selectedVariant.color_name}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAdd}
                  className="w-full btn-gold flex items-center justify-center gap-2.5 text-sm py-3.5"
                >
                  <ShoppingCart size={18} />
                  Agregar al carrito
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
