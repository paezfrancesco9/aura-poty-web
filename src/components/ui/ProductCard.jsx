import { Plus } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import toast from 'react-hot-toast'

const genderBadge = {
  femenino: { label: 'Femenino', className: 'bg-pink-500/20 text-pink-200 text-xs px-2 py-0.5 rounded-full border border-pink-500/30' },
  masculino: { label: 'Masculino', className: 'bg-blue-500/20 text-blue-200 text-xs px-2 py-0.5 rounded-full border border-blue-500/30' },
  unisex: { label: 'Unisex', className: 'bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full border border-white/20' },
}

export default function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem)

  const handleAdd = (e) => {
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} agregado`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #c9a874' },
      iconTheme: { primary: '#c9a874', secondary: '#1a1a1a' },
    })
  }

  const badge = genderBadge[product.gender] || genderBadge.unisex

  return (
    <div className="bg-dark-700 border border-white/10 rounded-2xl overflow-hidden group hover:border-gold/40 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-dark-600 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
            {product.emoji || '✨'}
          </div>
        )}

        {/* Gender badge */}
        <div className="absolute top-2 left-2">
          <span className={badge.className}>{badge.label}</span>
        </div>

        {/* Category */}
        {product.category && (
          <div className="absolute top-2 right-2">
            <span className="bg-dark-900/70 text-white/60 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              {product.category}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-0.5 line-clamp-2 group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        {product.brand && <p className="text-white/50 text-xs mb-2">{product.brand}</p>}
        {product.description && <p className="text-white/40 text-xs line-clamp-2 mb-3">{product.description}</p>}

        <div className="flex items-center justify-between">
          <span className="text-gold font-bold text-lg">
            Gs. {product.price?.toLocaleString('es-PY')}
          </span>
          <button onClick={handleAdd}
            className="bg-gold/15 hover:bg-gold text-gold hover:text-dark-900 p-2 rounded-full transition-all duration-200 hover:scale-110 border border-gold/30">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
