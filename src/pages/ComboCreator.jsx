import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core'
import { Sparkles, Trash2, ShoppingCart, X, Search } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const DEMO_PRODUCTS = [
  { id: 1,  name: 'Perfume Yara Mystical',   brand: 'Lattafa', price: 85000, emoji: '🌸', category: 'Perfumes' },
  { id: 2,  name: 'Perfume Asad',            brand: 'Lattafa', price: 90000, emoji: '🌿', category: 'Perfumes' },
  { id: 3,  name: 'Lip Glow Oil',            brand: 'DIOR',    price: 45000, emoji: '💄', category: 'Maquillaje' },
  { id: 4,  name: 'Disaar HA Cream',         brand: 'Disaar',  price: 55000, emoji: '✨', category: 'Skincare' },
  { id: 5,  name: 'Sunscreen SPF90',         brand: 'Disaar',  price: 48000, emoji: '🌞', category: 'Skincare' },
  { id: 6,  name: 'Nivea Facial 7en1',       brand: 'Nivea',   price: 35000, emoji: '💙', category: 'Skincare' },
  { id: 7,  name: 'Rhode Lip Peptide',       brand: 'Rhode',   price: 65000, emoji: '💋', category: 'Maquillaje' },
  { id: 8,  name: 'Lip Gloss Set x4',        brand: 'DH',      price: 50000, emoji: '💅', category: 'Maquillaje' },
  { id: 9,  name: 'Meslizam Eau de Parfum',  brand: 'Meslizam',price: 95000, emoji: '🏺', category: 'Perfumes' },
  { id: 10, name: "Pond's Clarant B3",       brand: "Pond's",  price: 40000, emoji: '🌿', category: 'Skincare' },
  { id: 11, name: 'Disaar Whitening Cream',  brand: 'Disaar',  price: 52000, emoji: '⚡', category: 'Skincare' },
  { id: 12, name: 'St. Ives Exfoliante',     brand: "St. Ives",price: 38000, emoji: '🌱', category: 'Skincare' },
]

const CONTAINERS = [
  {
    id: 'bolsa_normal',
    label: 'Bolsa Normal',
    price: 0,
    priceLabel: 'Gratis',
    badgeClass: 'bg-green-500/20 text-green-300 border border-green-500/30',
    activeClass: 'border-amber-400 bg-amber-900/20 shadow-amber-400/20',
    idleClass:   'border-white/15 bg-dark-700/50 hover:border-amber-500/50',
    textActive:  'text-amber-300',
  },
  {
    id: 'bolsa_transparente',
    label: 'Bolsa Transparente',
    price: 5000,
    priceLabel: '+Gs. 5.000',
    badgeClass: 'bg-sky-500/20 text-sky-200 border border-sky-500/30',
    activeClass: 'border-sky-400 bg-sky-900/20 shadow-sky-400/20',
    idleClass:   'border-white/15 bg-dark-700/50 hover:border-sky-500/50',
    textActive:  'text-sky-300',
  },
  {
    id: 'caja',
    label: 'Caja Regalo',
    price: 7000,
    priceLabel: '+Gs. 7.000',
    badgeClass: 'bg-gold/20 text-gold border border-gold/30',
    activeClass: 'border-gold bg-gold/10 shadow-gold/20',
    idleClass:   'border-white/15 bg-dark-700/50 hover:border-gold/50',
    textActive:  'text-gold',
  },
]

// ── SVGs ──────────────────────────────────────────────────────────────────────
function BolsaNormalSVG() {
  return (
    <svg viewBox="0 0 100 118" className="w-14 h-16" fill="none">
      <ellipse cx="50" cy="114" rx="28" ry="4" fill="rgba(0,0,0,0.3)" />
      <path d="M18 46 L11 108 L89 108 L82 46 Z" fill="#c8956c" stroke="#a0714a" strokeWidth="1.5" />
      <rect x="18" y="40" width="64" height="9" fill="#b07040" rx="2" />
      <path d="M34 46 Q34 20 50 20 Q66 20 66 46" fill="none" stroke="#7a4a1e" strokeWidth="6" strokeLinecap="round" />
      <path d="M22 58 L20 93" stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round" />
      <rect x="33" y="66" width="34" height="26" rx="3" fill="rgba(0,0,0,0.1)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    </svg>
  )
}

function BolsaTransparenteSVG() {
  return (
    <svg viewBox="0 0 100 122" className="w-14 h-16" fill="none">
      <ellipse cx="50" cy="118" rx="28" ry="4" fill="rgba(0,0,0,0.2)" />
      <path d="M20 50 L12 110 L88 110 L80 50 Z" fill="rgba(186,230,255,0.13)" stroke="#93c5fd" strokeWidth="1.5" />
      <ellipse cx="50" cy="48" rx="30" ry="7" fill="rgba(147,197,253,0.13)" stroke="#7dd3fc" strokeWidth="1.5" />
      <path d="M37 40 Q50 30 63 40" fill="none" stroke="#f9a8d4" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M37 40 Q31 28 39 24 Q47 31 50 29 Q53 31 61 24 Q69 28 63 40" fill="none" stroke="#f9a8d4" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 62 L23 95" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function CajaSVG() {
  return (
    <svg viewBox="0 0 110 102" className="w-16 h-14" fill="none">
      <ellipse cx="55" cy="99" rx="40" ry="4" fill="rgba(0,0,0,0.3)" />
      <rect x="10" y="45" width="90" height="51" rx="2" fill="#c8956c" stroke="#a0714a" strokeWidth="1.5" />
      <rect x="7" y="33" width="96" height="15" rx="2" fill="#d4956a" stroke="#a0714a" strokeWidth="1.5" />
      <rect x="49" y="33" width="12" height="63" fill="#c9a874" opacity="0.85" />
      <rect x="10" y="66" width="90" height="10" fill="#c9a874" opacity="0.85" />
      <path d="M46 33 Q40 22 44 18 Q51 24 53 33" fill="#e8c98a" stroke="#c9a874" strokeWidth="1.2" />
      <path d="M64 33 Q70 22 66 18 Q59 24 57 33" fill="#e8c98a" stroke="#c9a874" strokeWidth="1.2" />
      <ellipse cx="55" cy="33" rx="5" ry="4" fill="#f0d49a" stroke="#c9a874" strokeWidth="1" />
    </svg>
  )
}

// ── Draggable product card ────────────────────────────────────────────────────
function DraggableProduct({ product, onAdd }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `product-${product.id}`,
    data: { product },
  })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  return (
    <div className="relative group/card">
      <div
        ref={setNodeRef} style={style} {...listeners} {...attributes}
        className={`bg-dark-700 border rounded-xl overflow-hidden select-none transition-all duration-200 group
          ${isDragging ? 'opacity-20 cursor-grabbing' : 'cursor-grab border-white/10 hover:border-gold/50'}`}
      >
        <div className="aspect-square bg-dark-600 relative overflow-hidden">
          {product.image_url
            ? <img src={product.image_url} alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <div className="w-full h-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                {product.emoji || '✨'}
              </div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1.5">
            <span className="text-white text-xs">↕ Arrastra</span>
          </div>
        </div>
        <div className="p-2">
          <p className="text-white text-xs font-semibold line-clamp-1 leading-tight">{product.name}</p>
          <p className="text-white/40 text-xs">{product.brand}</p>
          <p className="text-gold text-xs font-bold mt-0.5">Gs. {product.price?.toLocaleString('es-PY')}</p>
        </div>
      </div>

      <button
        onClick={() => onAdd(product)}
        className="absolute top-1 right-1 bg-gold text-dark-900 font-bold w-6 h-6 rounded-full
          flex items-center justify-center text-sm shadow-lg z-10
          opacity-0 group-hover/card:opacity-100 hover:scale-110 transition-all duration-200"
      >+</button>
    </div>
  )
}

// ── Single large drop zone ────────────────────────────────────────────────────
function BigDropZone({ items, onRemoveItem }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'combo-zone' })

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-2xl transition-all duration-300 min-h-[420px] flex flex-col
        ${isOver ? 'border-gold bg-gold/8 scale-[1.01]' : 'border-white/15 bg-dark-800/40'}`}
    >
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <div className={`text-6xl transition-transform duration-300 ${isOver ? 'scale-125' : ''}`}>
            {isOver ? '✨' : '🛍️'}
          </div>
          <p className={`font-medium transition-colors ${isOver ? 'text-gold' : 'text-white/30'}`}>
            {isOver ? 'Soltalo aqui!' : 'Arrastra productos aqui'}
          </p>
          <p className="text-white/20 text-xs">O usa el boton + en cada producto</p>
        </div>
      ) : (
        <div className="p-4 flex-1">
          <div className="grid grid-cols-3 gap-2">
            {items.map((item, idx) => (
              <div key={`${item.id}-${idx}`}
                className="relative group/item bg-dark-700 border border-white/10 rounded-xl overflow-hidden">
                <div className="aspect-square bg-dark-600">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">{item.emoji}</div>
                  }
                </div>
                <div className="p-1.5">
                  <p className="text-white text-xs font-medium line-clamp-1 leading-tight">{item.name}</p>
                  <p className="text-gold text-xs font-semibold">Gs. {item.price?.toLocaleString('es-PY')}</p>
                </div>
                <button
                  onClick={() => onRemoveItem(idx)}
                  className="absolute top-1 right-1 bg-dark-900/80 text-white/50 hover:text-red-400
                    w-5 h-5 rounded-full flex items-center justify-center
                    opacity-0 group-hover/item:opacity-100 transition-all"
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            {/* Drop hint while items exist */}
            {isOver && (
              <div className="aspect-square rounded-xl border-2 border-dashed border-gold/50 bg-gold/5 flex items-center justify-center">
                <span className="text-gold text-xl">+</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ComboCreator() {
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [activeProduct, setActiveProduct] = useState(null)
  const [comboItems, setComboItems] = useState([])
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const addItem = useCartStore(s => s.addItem)
  const setContainer = useCartStore(s => s.setContainer)
  const navigate = useNavigate()

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) return
    const { data, error } = await supabase.from('products').select('*').eq('is_active', true)
    if (!error && data?.length > 0) setProducts(data)
  }

  const handleDragStart = (e) => setActiveProduct(e.active.data.current?.product)

  const handleDragEnd = ({ active, over }) => {
    setActiveProduct(null)
    if (!over || over.id !== 'combo-zone') return
    const product = active.data.current?.product
    if (product) {
      setComboItems(prev => [...prev, product])
      toast.success(`${product.name} agregado al combo`, {
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #c9a874' },
        iconTheme: { primary: '#c9a874', secondary: '#1a1a1a' },
      })
    }
  }

  const handleClickAdd = (product) => {
    setComboItems(prev => [...prev, product])
    toast.success(`${product.name} agregado`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #c9a874' },
      iconTheme: { primary: '#c9a874', secondary: '#1a1a1a' },
    })
  }

  const removeItem = (idx) => setComboItems(prev => prev.filter((_, i) => i !== idx))
  const clearAll = () => { setComboItems([]); setSelectedContainer(null) }

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]

  const filteredProducts = products.filter(p => {
    const matchCat = search || activeCategory === 'Todos' || p.category === activeCategory
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const productTotal = comboItems.reduce((sum, p) => sum + p.price, 0)
  const containerPrice = selectedContainer ? CONTAINERS.find(c => c.id === selectedContainer)?.price || 0 : 0
  const grandTotal = productTotal + containerPrice

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-gold/70 text-xs tracking-widest uppercase mb-2">Personaliza tu regalo</p>
          <h1 className="font-display text-4xl md:text-5xl text-white font-light tracking-wide flex items-center justify-center gap-3">
            <Sparkles className="text-gold" size={32} />
            Crea tu Combo
          </h1>
          <p className="text-white/50 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Arrastra los productos a la zona o usa el <span className="text-gold font-semibold">+</span>.
            Luego elegis el contenedor. El precio se calcula solo.
          </p>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* ── Layout principal ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Productos — 3 columnas, scrolleable */}
            <div className="lg:col-span-3">
              <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gold text-dark-900 text-xs font-bold flex items-center justify-center">1</span>
                Elegis los productos
                <span className="text-white/30 text-xs font-normal ml-1">({filteredProducts.length} disponibles)</span>
              </h2>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar producto o marca..."
                  className="w-full bg-dark-700 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-gold/50 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex gap-1.5 flex-wrap mb-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 ${
                      activeCategory === cat
                        ? 'bg-gold text-dark-900 border-gold font-semibold'
                        : 'border-white/15 text-white/50 hover:border-gold/40 hover:text-white/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto scrollbar-hide pr-1">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-3 py-12 text-center text-white/30 text-sm">
                    No se encontraron productos
                  </div>
                ) : filteredProducts.map(product => (
                  <DraggableProduct key={product.id} product={product} onAdd={handleClickAdd} />
                ))}
              </div>
            </div>

            {/* Drop zone — grande */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gold text-dark-900 text-xs font-bold flex items-center justify-center">2</span>
                  Tu combo
                  {comboItems.length > 0 && (
                    <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full border border-gold/30">
                      {comboItems.length} items
                    </span>
                  )}
                </h2>
                {comboItems.length > 0 && (
                  <button onClick={clearAll} className="text-white/30 hover:text-red-400 text-xs transition-colors flex items-center gap-1">
                    <Trash2 size={12} /> Limpiar
                  </button>
                )}
              </div>

              <BigDropZone items={comboItems} onRemoveItem={removeItem} />
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeProduct && (
              <div className="bg-dark-700 border-2 border-gold rounded-xl overflow-hidden w-28 shadow-2xl shadow-gold/30 rotate-6 scale-110 pointer-events-none">
                <div className="aspect-square bg-dark-600 flex items-center justify-center">
                  {activeProduct.image_url
                    ? <img src={activeProduct.image_url} alt={activeProduct.name} className="w-full h-full object-cover" />
                    : <span className="text-3xl">{activeProduct.emoji}</span>
                  }
                </div>
                <div className="p-2">
                  <p className="text-white text-xs font-medium line-clamp-1">{activeProduct.name}</p>
                  <p className="text-gold text-xs">Gs. {activeProduct.price?.toLocaleString('es-PY')}</p>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* ── Paso 3: Contenedor (aparece cuando hay productos) ── */}
        {comboItems.length > 0 && (
          <div className="mt-10 animate-slide-up">
            <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold text-dark-900 text-xs font-bold flex items-center justify-center">3</span>
              Elegis el contenedor
              <span className="text-white/30 text-xs font-normal">(opcional)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CONTAINERS.map(c => {
                const isSelected = selectedContainer === c.id
                const SVG = c.id === 'bolsa_normal' ? BolsaNormalSVG
                  : c.id === 'bolsa_transparente' ? BolsaTransparenteSVG
                  : CajaSVG

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContainer(isSelected ? null : c.id)}
                    className={`border-2 rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] shadow-lg
                      ${isSelected ? `${c.activeClass} shadow-lg` : c.idleClass}`}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <SVG />
                      <div>
                        <p className={`font-semibold text-sm ${isSelected ? c.textActive : 'text-white'}`}>{c.label}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${c.badgeClass}`}>
                          {c.priceLabel}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <p className={`text-xs font-semibold ${c.textActive}`}>✓ Seleccionado</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Total & CTA ── */}
        {comboItems.length > 0 && (
          <div className="mt-8 glass rounded-2xl p-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total del combo</p>
                <p className="text-5xl font-display font-light text-gradient">
                  Gs. {grandTotal.toLocaleString('es-PY')}
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-white/40 text-xs">{comboItems.length} producto(s)</span>
                  {selectedContainer && containerPrice > 0 && (
                    <span className="text-gold/60 text-xs">
                      + {CONTAINERS.find(c => c.id === selectedContainer)?.priceLabel} contenedor
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  comboItems.forEach(p => addItem(p))
                  const containerObj = selectedContainer ? CONTAINERS.find(c => c.id === selectedContainer) : null
                  setContainer(containerObj ? { id: containerObj.id, label: containerObj.label, price: containerObj.price, priceLabel: containerObj.priceLabel } : null)
                  navigate('/carrito')
                }}
                className="btn-gold text-sm flex items-center gap-2 shrink-0"
              >
                <ShoppingCart size={15} /> Agregar al carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
