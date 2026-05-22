import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/ui/ProductCard'
import { supabase } from '../lib/supabase'
import { CATEGORIES as BASE_CATEGORIES } from '../lib/constants'

const CATEGORIES = ['Todos', ...BASE_CATEGORIES]
const GENDERS = ['Todos', 'Femenino', 'Masculino', 'Unisex']

const DEMO_PRODUCTS = [
  { id: 1, name: 'Perfume Yara Mystical', brand: 'Lattafa', price: 85000, category: 'Perfumes', gender: 'femenino', emoji: '🌸', description: 'Fragancia floral y amaderada, 100ml' },
  { id: 2, name: 'Perfume Asad', brand: 'Lattafa', price: 90000, category: 'Perfumes', gender: 'masculino', emoji: '🌿', description: 'Fragancia oriental intensa, 100ml' },
  { id: 3, name: 'Lip Glow Oil', brand: 'DIOR', price: 45000, category: 'Maquillaje', gender: 'femenino', emoji: '💄', description: 'Aceite gloss con color y brillo' },
  { id: 4, name: 'Disaar HA Cream', brand: 'Disaar', price: 55000, category: 'Skincare', gender: 'unisex', emoji: '✨', description: 'Crema hidratante con acido hialuronico' },
  { id: 5, name: 'Sunscreen SPF90', brand: 'Disaar', price: 48000, category: 'Skincare', gender: 'unisex', emoji: '🌞', description: 'Protector solar ligero, 40g' },
  { id: 6, name: 'Nivea Facial 7en1', brand: 'Nivea', price: 35000, category: 'Skincare', gender: 'femenino', emoji: '💙', description: 'Crema facial multibeneficio' },
  { id: 7, name: 'Rhode Lip Peptide', brand: 'Rhode', price: 65000, category: 'Maquillaje', gender: 'femenino', emoji: '💋', description: 'Tratamiento labial con color' },
  { id: 8, name: "Pond's Clarant B3", brand: "Pond's", price: 40000, category: 'Skincare', gender: 'unisex', emoji: '🌿', description: 'Crema aclarante con niacinamida' },
  { id: 9, name: 'Meslizam Eau de Parfum', brand: 'Meslizam', price: 95000, category: 'Perfumes', gender: 'masculino', emoji: '🏺', description: 'Fragancia arabe premium, 100ml' },
  { id: 10, name: 'Lip Gloss Set x4', brand: 'DH', price: 50000, category: 'Maquillaje', gender: 'femenino', emoji: '💅', description: 'Set de 4 gloss con brillo intenso' },
  { id: 11, name: 'Disaar Whitening Cream', brand: 'Disaar', price: 52000, category: 'Skincare', gender: 'unisex', emoji: '⚡', description: 'Crema aclarante con vitamina C' },
  { id: 12, name: 'St. Ives Exfoliante', brand: "St. Ives", price: 38000, category: 'Skincare', gender: 'unisex', emoji: '🌱', description: 'Exfoliante facial con avena y miel' },
]

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const activeCategory = searchParams.get('cat') || 'Todos'
  const activeGender = searchParams.get('gender') || 'Todos'

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) return
    setLoading(true)
    const { data, error } = await supabase
      .from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
    if (!error && data?.length > 0) setProducts(data)
    setLoading(false)
  }

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'Todos') params.delete(key)
    else params.set(key, value)
    setSearchParams(params)
  }

  const filtered = products.filter(p => {
    const matchCat = search || activeCategory === 'Todos' || p.category?.toLowerCase() === activeCategory.toLowerCase()
    const matchGender = activeGender === 'Todos' || p.gender?.toLowerCase() === activeGender.toLowerCase()
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchGender && matchSearch
  })

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-10">
          <p className="text-gold/70 text-xs tracking-widest uppercase mb-2">Descubri</p>
          <h1 className="font-display text-4xl md:text-5xl text-white font-light tracking-wide">Catalogo</h1>
          <p className="text-white/40 mt-2 text-sm">{filtered.length} productos encontrados</p>
        </div>

        {/* Search + Filter toggle */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar productos o marcas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-dark-700 border border-white/10 rounded-full pl-11 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-full border text-sm font-medium transition-all ${
              showFilters ? 'bg-gold text-dark-900 border-gold' : 'border-white/15 text-white/70 hover:border-gold/50 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-dark-700 border border-white/10 rounded-2xl p-5 mb-6 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Categoria</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setFilter('cat', cat)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        activeCategory === cat
                          ? 'bg-gold text-dark-900 border-gold font-medium'
                          : 'border-white/15 text-white/70 hover:border-gold/40 hover:text-white'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Genero</p>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map(g => (
                    <button key={g} onClick={() => setFilter('gender', g)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        activeGender === g
                          ? 'bg-gold text-dark-900 border-gold font-medium'
                          : 'border-white/15 text-white/70 hover:border-gold/40 hover:text-white'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category quick pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter('cat', cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm border transition-all ${
                activeCategory === cat
                  ? 'bg-gold text-dark-900 border-gold font-medium'
                  : 'border-white/15 text-white/60 hover:border-gold/40 hover:text-white'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-dark-700 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-white/40">No encontramos productos con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  )
}
