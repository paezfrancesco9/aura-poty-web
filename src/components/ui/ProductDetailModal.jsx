import { X, ShoppingCart, Check, Heart, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useCartStore } from '../../store/useCartStore'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { useRecentlyViewedStore } from '../../store/useRecentlyViewedStore'
import { useProductsStore } from '../../store/useProductsStore'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const genderBadge = {
  femenino: { label: 'Femenino', className: 'bg-pink-500/20 text-pink-200 text-xs px-2.5 py-1 rounded-full border border-pink-500/30' },
  masculino: { label: 'Masculino', className: 'bg-blue-500/20 text-blue-200 text-xs px-2.5 py-1 rounded-full border border-blue-500/30' },
  unisex: { label: 'Unisex', className: 'bg-white/10 text-white/70 text-xs px-2.5 py-1 rounded-full border border-white/20' },
}

function getRelated(current, all, max = 8) {
  const others = all.filter(p => p.id !== current.id)
  const sameCat = others.filter(p => p.category && p.category === current.category)
  const usedIds = new Set(sameCat.map(p => p.id))
  const sameGender = others.filter(p => !usedIds.has(p.id) && p.gender && p.gender === current.gender)
  sameGender.forEach(p => usedIds.add(p.id))
  const rest = others.filter(p => !usedIds.has(p.id))
  return [...sameCat, ...sameGender, ...rest].slice(0, max)
}

export default function ProductDetailModal({ product, initialVariant, onClose, onAddToCombo, addLabel }) {
  const addItem = useCartStore(s => s.addItem)
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite)
  const addProduct = useRecentlyViewedStore(s => s.addProduct)
  const allProducts = useProductsStore(s => s.products)

  // Navegación interna entre productos
  const [currentProduct, setCurrentProduct] = useState(product)
  const isFav = useFavoritesStore(s => s.isFavorite(currentProduct.id))

  const variants = currentProduct.variants || []
  const hasMainImage = !!currentProduct.image_url
  const [selectedVariant, setSelectedVariant] = useState(initialVariant ?? null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const totalColorOptions = variants.length + (hasMainImage && variants.length > 0 ? 1 : 0)
  const showSwatches = totalColorOptions >= 2

  // Refs
  const bodyRef = useRef(null)
  const sliderRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  // Productos relacionados
  const related = useMemo(
    () => getRelated(currentProduct, allProducts),
    [allProducts, currentProduct.id]
  )

  // Flash deals relacionadas
  const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL
  const [flashDeals, setFlashDeals] = useState([])
  const flashSliderRef = useRef(null)
  const [flashCanLeft, setFlashCanLeft] = useState(false)
  const [flashCanRight, setFlashCanRight] = useState(false)

  useEffect(() => {
    if (!hasSupabase) return
    supabase.from('flash_sales').select('*').eq('is_active', true).then(({ data }) => {
      if (!data) return
      const active = data.filter(f => !f.ends_at || new Date(f.ends_at) > new Date())
      const sameCat = active.filter(f => f.category === currentProduct.category)
      const others = active.filter(f => f.category !== currentProduct.category)
      setFlashDeals([...sameCat, ...others].slice(0, 8))
    })
  }, [currentProduct.category, hasSupabase])

  const checkFlashScroll = () => {
    const el = flashSliderRef.current
    if (!el) return
    setFlashCanLeft(el.scrollLeft > 4)
    setFlashCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  const scrollFlash = (dir) => {
    const el = flashSliderRef.current
    if (!el) return
    const card = el.querySelector('[data-flash-card]')
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 180) + 12), behavior: 'smooth' })
  }

  // Registrar en historial
  useEffect(() => {
    addProduct(currentProduct)
  }, [currentProduct.id])

  // Scroll al tope del modal cuando se navega a un producto relacionado
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
    if (sliderRef.current) sliderRef.current.scrollLeft = 0
    setCanLeft(false)
    setSelectedVariant(null)
    setImgLoaded(false)
  }, [currentProduct.id])

  // Verificar si el slider puede scrollear
  useEffect(() => {
    const timer = setTimeout(checkScroll, 60)
    return () => clearTimeout(timer)
  }, [related])

  // Keyboard + body overflow
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const currentImage = selectedVariant?.image_url || currentProduct.image_url
  const badge = genderBadge[currentProduct.gender] || genderBadge.unisex

  const handleSelectVariant = (v) => {
    setImgLoaded(false)
    setSelectedVariant(v)
  }

  const handleAdd = () => {
    if (onAddToCombo) {
      onAddToCombo(currentProduct, selectedVariant)
    } else {
      addItem(currentProduct, selectedVariant)
      const colorText = selectedVariant ? ` — ${selectedVariant.color_name}` : ''
      toast.success(`${currentProduct.name}${colorText} agregado`, {
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #c9a874' },
        iconTheme: { primary: '#c9a874', secondary: '#1a1a1a' },
      })
    }
    onClose()
  }

  const handleOpenRelated = (rel) => {
    setCurrentProduct(rel)
  }

  const checkScroll = () => {
    const el = sliderRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  const scroll = (dir) => {
    const el = sliderRef.current
    if (!el) return
    const card = el.querySelector('[data-card]')
    const cardW = card ? card.offsetWidth + 12 : 200
    el.scrollBy({ left: dir * cardW, behavior: 'smooth' })
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-6"
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
            {currentProduct.category && (
              <span className="bg-dark-600 text-white/40 text-xs px-2.5 py-1 rounded-full">
                {currentProduct.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(currentProduct)}
              className={`rounded-full p-2 transition-all ${
                isFav
                  ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                  : 'text-white/40 hover:text-rose-400 bg-white/5 hover:bg-white/15'
              }`}
              title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white bg-white/5 hover:bg-white/15 rounded-full p-2 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div ref={bodyRef} className="overflow-y-auto flex-1">

          {/* Producto principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-0">

            {/* ── Image panel ── */}
            <div className="relative bg-dark-700 sm:min-h-[480px]">
              <div className="aspect-square sm:aspect-auto sm:h-full sm:min-h-[480px] overflow-hidden">
                {currentImage ? (
                  <img
                    key={currentImage}
                    src={currentImage}
                    alt={selectedVariant?.color_name || currentProduct.name}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl bg-dark-700">
                    {currentProduct.emoji || '✨'}
                  </div>
                )}
                {!imgLoaded && currentImage && (
                  <div className="absolute inset-0 bg-dark-700 animate-pulse" />
                )}
              </div>

              {/* Thumbnail strip mobile */}
              {showSwatches && (
                <div className="sm:hidden absolute bottom-0 inset-x-0 flex gap-2 p-3 bg-gradient-to-t from-black/60 to-transparent overflow-x-auto scrollbar-hide">
                  {hasMainImage && variants.length > 0 && (
                    <button
                      onClick={() => { setImgLoaded(false); setSelectedVariant(null) }}
                      className={`shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedVariant === null ? 'border-gold scale-105' : 'border-white/20 opacity-70'
                      }`}
                    >
                      <img src={currentProduct.image_url} alt="Principal" className="w-full h-full object-cover" />
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
              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-white font-light tracking-wide leading-tight">
                  {selectedVariant?.title || currentProduct.name}
                </h2>
                {selectedVariant && !selectedVariant.title && (
                  <p className="text-gold/70 text-sm mt-0.5">{selectedVariant.color_name}</p>
                )}
                {currentProduct.brand && (
                  <p className="text-white/40 text-sm mt-1">{currentProduct.brand}</p>
                )}
              </div>

              {currentProduct.description && (
                <p className="text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
                  {currentProduct.description}
                </p>
              )}

              {/* Color variants */}
              {showSwatches && (
                <div className="border-t border-white/5 pt-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                    Color:{' '}
                    <span className="text-white/80 normal-case tracking-normal font-medium">
                      {selectedVariant?.color_name || 'Principal'}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-3">
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
                          <img src={currentProduct.image_url} alt="Principal" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-xs leading-none ${selectedVariant === null ? 'text-gold font-medium' : 'text-white/40'}`}>
                          Principal
                        </span>
                      </button>
                    )}
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

              <div className="flex-1" />

              {/* Price + Add to cart */}
              <div className="border-t border-white/5 pt-4 mt-auto">
                <div className="mb-4">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Precio</p>
                  <span className="text-gold font-bold text-3xl">
                    Gs. {currentProduct.price?.toLocaleString('es-PY')}
                  </span>
                </div>
                <button
                  onClick={handleAdd}
                  className="w-full btn-gold flex items-center justify-center gap-2.5 text-sm py-3.5"
                >
                  <ShoppingCart size={18} />
                  {addLabel || 'Agregar al carrito'}
                </button>
              </div>
            </div>

          </div>

          {/* ── Ofertas Relámpago relacionadas ── */}
          {flashDeals.length > 0 && (
            <div className="border-t border-orange-500/15 px-5 sm:px-7 pt-6 pb-6 bg-gradient-to-b from-orange-950/20 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-orange-400 fill-current" />
                  <p className="text-orange-400/80 text-xs uppercase tracking-widest font-bold">Ofertas Relámpago</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => scrollFlash(-1)} disabled={!flashCanLeft}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${flashCanLeft ? 'bg-dark-700 border-white/15 text-white/60 hover:text-white' : 'bg-dark-800 border-white/5 text-white/15 cursor-default'}`}>
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => scrollFlash(1)} disabled={!flashCanRight}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${flashCanRight ? 'bg-dark-700 border-white/15 text-white/60 hover:text-white' : 'bg-dark-800 border-white/5 text-white/15 cursor-default'}`}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div
                ref={flashSliderRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide"
                style={{ scrollSnapType: 'x mandatory' }}
                onScroll={checkFlashScroll}
              >
                {flashDeals.map(deal => {
                  const discount = deal.sale_price ? Math.round((1 - deal.sale_price / deal.price) * 100) : null
                  const displayPrice = deal.sale_price ?? deal.price
                  return (
                    <a
                      key={deal.id}
                      href="/ofertas"
                      data-flash-card
                      onClick={onClose}
                      className="shrink-0 w-[72%] sm:w-[calc(25%-9px)] text-left group block"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="bg-dark-700 border border-orange-500/20 rounded-xl overflow-hidden group-hover:border-orange-400/50 transition-all duration-300">
                        <div className="relative aspect-square bg-dark-600 overflow-hidden">
                          {deal.image_url ? (
                            <img src={deal.image_url} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">{deal.emoji || '⚡'}</div>
                          )}
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-md">
                            <Zap size={7} className="fill-current" /> FLASH
                          </div>
                          {discount && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">-{discount}%</div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-white text-xs font-medium line-clamp-2 leading-tight group-hover:text-orange-300 transition-colors">{deal.name}</p>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-orange-400 font-bold text-sm">Gs. {Number(displayPrice).toLocaleString('es-PY')}</span>
                            {deal.sale_price && <span className="text-nude/35 text-xs line-through">Gs. {Number(deal.price).toLocaleString('es-PY')}</span>}
                          </div>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── También te puede interesar ── */}
          {related.length > 0 && (
            <div className="border-t border-white/5 px-5 sm:px-7 pt-6 pb-7">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/35 text-xs uppercase tracking-widest">
                  También te puede interesar
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => scroll(-1)}
                    disabled={!canLeft}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 ${
                      canLeft
                        ? 'bg-dark-700 border-white/15 text-white/60 hover:border-white/30 hover:text-white hover:bg-dark-600'
                        : 'bg-dark-800 border-white/5 text-white/15 cursor-default'
                    }`}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => scroll(1)}
                    disabled={!canRight}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 ${
                      canRight
                        ? 'bg-dark-700 border-white/15 text-white/60 hover:border-white/30 hover:text-white hover:bg-dark-600'
                        : 'bg-dark-800 border-white/5 text-white/15 cursor-default'
                    }`}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div
                ref={sliderRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide"
                style={{ scrollSnapType: 'x mandatory' }}
                onScroll={checkScroll}
              >
                {related.map(rel => (
                  <button
                    key={rel.id}
                    data-card
                    onClick={() => handleOpenRelated(rel)}
                    className="shrink-0 w-[72%] sm:w-[calc(25%-9px)] text-left group"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="bg-dark-700 border border-white/10 rounded-xl overflow-hidden group-hover:border-gold/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-black/30">
                      <div className="aspect-square bg-dark-600 overflow-hidden">
                        {rel.image_url ? (
                          <img
                            src={rel.image_url}
                            alt={rel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                            {rel.emoji || '✨'}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-white text-xs font-medium line-clamp-2 leading-tight group-hover:text-gold transition-colors duration-200">
                          {rel.name}
                        </p>
                        {rel.brand && (
                          <p className="text-white/30 text-xs mt-0.5">{rel.brand}</p>
                        )}
                        <p className="text-gold text-sm font-bold mt-1.5">
                          Gs. {rel.price?.toLocaleString('es-PY')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
