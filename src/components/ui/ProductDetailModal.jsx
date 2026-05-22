import { X, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '../../store/useCartStore'
import toast from 'react-hot-toast'

const genderBadge = {
  femenino: { label: 'Femenino', className: 'bg-pink-500/20 text-pink-200 text-xs px-2.5 py-1 rounded-full border border-pink-500/30' },
  masculino: { label: 'Masculino', className: 'bg-blue-500/20 text-blue-200 text-xs px-2.5 py-1 rounded-full border border-blue-500/30' },
  unisex: { label: 'Unisex', className: 'bg-white/10 text-white/70 text-xs px-2.5 py-1 rounded-full border border-white/20' },
}

export default function ProductDetailModal({ product, colorVariants = [], onClose }) {
  const addItem = useCartStore(s => s.addItem)

  // El producto activo dentro del modal (puede cambiar al clickear un swatch)
  const [active, setActive] = useState(product)
  const [imgLoaded, setImgLoaded] = useState(false)

  const hasColors = colorVariants.length >= 2
  const badge = genderBadge[active.gender] || genderBadge.unisex

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleSelectColor = (v) => {
    setImgLoaded(false)
    setActive(v)
  }

  const handleAdd = () => {
    addItem(active)
    toast.success(`${active.name} agregado`, {
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
      <div
        className="bg-dark-800 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        style={{ animation: 'slideUp 0.28s cubic-bezier(0.34,1.1,0.64,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 sm:px-7 sm:pt-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={badge.className}>{badge.label}</span>
            {active.category && (
              <span className="bg-dark-600 text-white/40 text-xs px-2.5 py-1 rounded-full">
                {active.category}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white bg-white/5 hover:bg-white/15 rounded-full p-2 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2">

            {/* Imagen */}
            <div className="relative bg-dark-700 sm:min-h-[480px]">
              <div className="aspect-square sm:aspect-auto sm:h-full sm:min-h-[480px] overflow-hidden">
                {active.image_url ? (
                  <img
                    key={active.image_url}
                    src={active.image_url}
                    alt={active.name}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl bg-dark-700">
                    {active.emoji || '✨'}
                  </div>
                )}
                {!imgLoaded && active.image_url && (
                  <div className="absolute inset-0 bg-dark-700 animate-pulse" />
                )}
              </div>

              {/* Miniaturas mobile */}
              {hasColors && (
                <div className="sm:hidden absolute bottom-0 inset-x-0 flex gap-2 p-3 bg-gradient-to-t from-black/60 to-transparent overflow-x-auto scrollbar-hide">
                  {colorVariants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectColor(v)}
                      className={`shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        active.id === v.id ? 'border-gold scale-105' : 'border-white/20 opacity-70'
                      }`}
                      style={!v.image_url ? { backgroundColor: v.color_hex || '#888' } : {}}
                    >
                      {v.image_url && <img src={v.image_url} alt={v.color_name || v.name} className="w-full h-full object-cover" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col p-5 sm:p-7 gap-4 sm:overflow-y-auto">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-white font-light tracking-wide leading-tight">
                  {active.name}
                </h2>
                {active.color_name && (
                  <p className="text-gold/70 text-sm mt-1 flex items-center gap-1.5">
                    {active.color_hex && (
                      <span className="inline-block w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: active.color_hex }} />
                    )}
                    {active.color_name}
                  </p>
                )}
                {active.brand && <p className="text-white/40 text-sm mt-1">{active.brand}</p>}
              </div>

              {active.description && (
                <p className="text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
                  {active.description}
                </p>
              )}

              {/* Selector de colores */}
              {hasColors && (
                <div className="border-t border-white/5 pt-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                    Color:{' '}
                    <span className="text-white/80 normal-case tracking-normal font-medium">
                      {active.color_name || active.name}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {colorVariants.map(v => {
                      const isActive = active.id === v.id
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleSelectColor(v)}
                          title={v.color_name || v.name}
                          className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${
                            isActive ? 'scale-105' : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                            isActive ? 'border-gold shadow-lg shadow-gold/20' : 'border-white/15'
                          }`}
                            style={!v.image_url ? { backgroundColor: v.color_hex || '#888' } : {}}
                          >
                            {v.image_url && <img src={v.image_url} alt={v.color_name || v.name} className="w-full h-full object-cover" />}
                          </div>
                          <span className={`text-xs leading-none text-center max-w-[56px] truncate ${isActive ? 'text-gold font-medium' : 'text-white/40'}`}>
                            {v.color_name || v.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex-1" />

              {/* Precio + Agregar */}
              <div className="border-t border-white/5 pt-4 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Precio</p>
                    <span className="text-gold font-bold text-3xl">
                      Gs. {active.price?.toLocaleString('es-PY')}
                    </span>
                  </div>
                </div>
                <button onClick={handleAdd} className="w-full btn-gold flex items-center justify-center gap-2.5 text-sm py-3.5">
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
