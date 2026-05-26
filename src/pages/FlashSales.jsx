import { useState, useEffect, useCallback } from 'react'
import { Zap, Clock, ShoppingCart, Flame } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/useCartStore'
import toast from 'react-hot-toast'

const DEMO_FLASH = [
  {
    id: 1,
    name: 'Perfume Yara Mystical',
    brand: 'Lattafa',
    price: 85000,
    sale_price: 60000,
    category: 'Perfumes',
    emoji: '🌸',
    is_active: true,
    stock: 5,
    ends_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: 2,
    name: 'Lip Glow Oil',
    brand: 'DIOR',
    price: 45000,
    sale_price: 29000,
    category: 'Maquillaje',
    emoji: '💄',
    is_active: true,
    stock: 3,
    ends_at: new Date(Date.now() + 28 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: 3,
    name: 'Disaar HA Cream',
    brand: 'Disaar',
    price: 55000,
    sale_price: null,
    category: 'Skincare',
    emoji: '✨',
    is_active: false,
    stock: 0,
    ends_at: new Date(Date.now() - 60 * 1000).toISOString(),
    image_url: null,
  },
]

function Countdown({ endsAt, onExpire }) {
  const [remaining, setRemaining] = useState(() => {
    if (!endsAt) return null
    return Math.max(0, new Date(endsAt) - new Date())
  })

  useEffect(() => {
    if (!endsAt) return
    const calc = () => {
      const diff = new Date(endsAt) - new Date()
      if (diff <= 0) {
        setRemaining(0)
        onExpire?.()
        return
      }
      setRemaining(diff)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [endsAt, onExpire])

  if (remaining === null) return null

  if (remaining === 0) return (
    <span className="text-red-400 text-xs font-bold tracking-wider">EXPIRADA</span>
  )

  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  const urgent = remaining < 10 * 60 * 1000

  return (
    <div className={`flex items-center gap-1.5 ${urgent ? 'text-red-400' : 'text-orange-300'}`}>
      <Clock size={11} className={urgent ? 'animate-pulse' : ''} />
      <span className="font-mono font-bold text-xs tabular-nums">
        {h > 0 ? `${String(h).padStart(2, '0')}:` : ''}
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  )
}

function FlashCard({ item, onExpire }) {
  const addItem = useCartStore(s => s.addItem)
  const isExpired = !item.is_active || (item.ends_at && new Date(item.ends_at) <= new Date())
  const displayPrice = item.sale_price ?? item.price
  const discount = item.sale_price
    ? Math.round((1 - item.sale_price / item.price) * 100)
    : null

  return (
    <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 group ${
      isExpired
        ? 'bg-dark-800 border border-dark-600 opacity-55 grayscale'
        : 'bg-dark-800 border border-orange-500/25 hover:border-orange-400/50 shadow-lg shadow-orange-900/20 hover:shadow-orange-500/15 hover:-translate-y-0.5'
    }`}>
      {isExpired && (
        <div className="absolute inset-0 bg-dark-900/60 z-10 flex items-center justify-center">
          <div className="bg-dark-800/90 border border-red-500/30 rounded-xl px-4 py-2 shadow-lg">
            <p className="text-red-400 font-bold text-xs tracking-widest">OFERTA FINALIZADA</p>
          </div>
        </div>
      )}

      <div className="relative h-44 bg-gradient-to-br from-dark-700 to-dark-900 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl select-none">
            {item.emoji || '⚡'}
          </div>
        )}

        {!isExpired && (
          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-red-900/50 tracking-wider">
            <Zap size={9} className="fill-current" />
            FLASH
          </div>
        )}

        {!isExpired && discount && (
          <div className="absolute top-2.5 right-2.5 bg-red-600 text-white text-xs font-black px-2 py-1 rounded-lg shadow-lg">
            -{discount}%
          </div>
        )}

        {!isExpired && item.ends_at && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <Flame size={11} className="text-orange-400 fill-current shrink-0" />
              <span className="text-white/60 text-[10px]">Termina en:</span>
              <Countdown endsAt={item.ends_at} onExpire={onExpire} />
            </div>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <p className="text-nude/40 text-[10px] uppercase tracking-wider mb-0.5">{item.brand}</p>
        <h3 className="text-white font-semibold text-sm mb-3 line-clamp-2 leading-snug">{item.name}</h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className={`font-bold text-base ${isExpired ? 'text-nude/40' : 'text-orange-400'}`}>
            Gs. {Number(displayPrice).toLocaleString('es-PY')}
          </span>
          {item.sale_price && (
            <span className="text-nude/35 text-xs line-through">
              Gs. {Number(item.price).toLocaleString('es-PY')}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            if (isExpired) return
            addItem(item)
            toast.success('Agregado al carrito')
          }}
          disabled={isExpired}
          className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            isExpired
              ? 'bg-dark-600 text-nude/25 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-400 hover:to-red-500 active:scale-95 shadow-md shadow-orange-900/40'
          }`}
        >
          <ShoppingCart size={13} />
          {isExpired ? 'Oferta finalizada' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}

export default function FlashSales() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL

  const fetchItems = useCallback(async () => {
    if (!hasSupabase) {
      setItems(DEMO_FLASH)
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('flash_sales')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setItems(data)
    setLoading(false)
  }, [hasSupabase])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleExpire = useCallback((id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, _clientExpired: true } : i))
  }, [])

  const isItemExpired = (item) =>
    !item.is_active || item._clientExpired || (item.ends_at && new Date(item.ends_at) <= new Date())

  const activeItems = items.filter(i => !isItemExpired(i))
  const expiredItems = items.filter(i => isItemExpired(i))

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero */}
      <div className="relative overflow-hidden pt-24 pb-14 border-b border-orange-500/15">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(249,115,22,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_60%,rgba(239,68,68,0.08),transparent)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/40 shrink-0">
              <Zap size={28} className="text-white fill-current" />
            </div>
            <div>
              <p className="text-orange-400 text-xs font-black uppercase tracking-[0.25em] mb-1">Tiempo limitado</p>
              <h1 className="text-white text-3xl sm:text-4xl font-display font-bold leading-none">
                Ofertas <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Relámpago</span>
              </h1>
            </div>
          </div>

          <p className="text-nude/55 mt-4 max-w-lg text-sm leading-relaxed">
            Descuentos explosivos por tiempo limitado. El cronómetro no para — ¡aprovechá antes de que se acabe!
          </p>

          {!loading && activeItems.length > 0 && (
            <div className="mt-5 inline-flex items-center gap-2.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
              <span className="text-orange-300 text-sm font-semibold">
                {activeItems.length} oferta{activeItems.length !== 1 ? 's' : ''} activa{activeItems.length !== 1 ? 's' : ''} ahora
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-dark-800 rounded-2xl h-72 animate-pulse border border-dark-600" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-dark-800 border border-dark-600 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Zap size={36} className="text-orange-500/30" />
            </div>
            <p className="text-white/50 text-lg font-medium">No hay ofertas relámpago en este momento</p>
            <p className="text-nude/30 text-sm mt-2">Volvé pronto para no perderte las próximas promociones</p>
          </div>
        ) : (
          <div className="space-y-12">
            {activeItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Zap size={16} className="text-orange-400 fill-current" />
                  <h2 className="text-white font-semibold">Activas ahora</h2>
                  <span className="text-orange-400/60 text-sm">({activeItems.length})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeItems.map(item => (
                    <FlashCard
                      key={item.id}
                      item={item}
                      onExpire={() => handleExpire(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {expiredItems.length > 0 && (
              <div>
                <h2 className="text-nude/35 font-medium text-xs uppercase tracking-[0.2em] mb-4">Ofertas finalizadas</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {expiredItems.map(item => (
                    <FlashCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
