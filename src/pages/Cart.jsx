import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, MessageCircle, ArrowLeft } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'

const getKey = (item) => item.cartKey || String(item.id)

export default function Cart() {
  const items = useCartStore(s => s.items)
  const removeItem = useCartStore(s => s.removeItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const total = useCartStore(s => s.total())
  const clearCart = useCartStore(s => s.clearCart)
  const container = useCartStore(s => s.container)

  const whatsappText = () => {
    const lines = items.map(i => {
      const colorTag = i.color_name ? ` (Color: ${i.color_name})` : ''
      return `• ${i.name}${colorTag} x${i.quantity} — Gs. ${(i.price * i.quantity).toLocaleString('es-PY')}`
    })
    const containerLine = container
      ? `\n• ${container.label} — ${container.price > 0 ? `Gs. ${container.price.toLocaleString('es-PY')}` : 'Gratis'}`
      : ''
    const text = `Hola Aura Poty! Quiero hacer un pedido:\n\n${lines.join('\n')}${containerLine}\n\nTotal: Gs. ${total.toLocaleString('es-PY')}`
    return encodeURIComponent(text)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart size={64} className="text-dark-500 mx-auto mb-4" />
          <h2 className="font-display text-3xl text-white mb-2">Tu carrito esta vacio</h2>
          <p className="text-nude/50 mb-8">Agrega productos del catalogo o crea un combo.</p>
          <Link to="/catalogo" className="btn-gold">Ver Catalogo</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-4 mb-8">
          <Link to="/catalogo" className="text-nude/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="section-title text-3xl">Mi Carrito</h1>
            <p className="text-nude/50 text-sm">{items.length} producto(s)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => {
              const key = getKey(item)
              return (
                <div key={key} className="card-dark p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-dark-600 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-2xl">{item.emoji || '✨'}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm line-clamp-1">{item.name}</p>
                    {item.brand && <p className="text-nude/40 text-xs">{item.brand}</p>}
                    {item.color_name && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.color_hex && (
                          <span
                            className="inline-block w-3 h-3 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: item.color_hex }}
                          />
                        )}
                        <span className="text-nude/50 text-xs">{item.color_name}</span>
                      </div>
                    )}
                    <p className="text-gold font-semibold text-sm mt-1">
                      Gs. {item.price?.toLocaleString('es-PY')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(key, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-dark-600 border border-dark-500 flex items-center justify-center hover:border-gold/50 text-nude/70 hover:text-white transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-white font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(key, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-dark-600 border border-dark-500 flex items-center justify-center hover:border-gold/50 text-nude/70 hover:text-white transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-white font-semibold text-sm">
                      Gs. {(item.price * item.quantity).toLocaleString('es-PY')}
                    </p>
                    <button
                      onClick={() => removeItem(key)}
                      className="text-nude/30 hover:text-red-400 transition-colors mt-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}

            <button
              onClick={clearCart}
              className="text-nude/40 hover:text-red-400 text-sm transition-colors flex items-center gap-1 mt-2"
            >
              <Trash2 size={14} /> Vaciar carrito
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card-dark p-6 sticky top-24">
              <h3 className="text-white font-semibold mb-4">Resumen del pedido</h3>

              <div className="space-y-2 mb-4">
                {items.map(item => {
                  const key = getKey(item)
                  return (
                    <div key={key} className="flex justify-between text-sm gap-2">
                      <span className="text-nude/60 line-clamp-1 flex-1">
                        {item.name}
                        {item.color_name && (
                          <span className="text-nude/40"> · {item.color_name}</span>
                        )}
                        {' '}x{item.quantity}
                      </span>
                      <span className="text-nude/70 shrink-0">
                        Gs. {(item.price * item.quantity).toLocaleString('es-PY')}
                      </span>
                    </div>
                  )
                })}
              </div>

              {container && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-nude/60 flex items-center gap-1.5">
                    <span className="text-base">
                      {container.id === 'bolsa_normal' ? '🛍️' : container.id === 'bolsa_transparente' ? '🎀' : '🎁'}
                    </span>
                    {container.label}
                  </span>
                  <span className={`shrink-0 ml-2 ${container.price === 0 ? 'text-green-400' : 'text-nude/70'}`}>
                    {container.price === 0 ? 'Gratis' : `Gs. ${container.price.toLocaleString('es-PY')}`}
                  </span>
                </div>
              )}

              <div className="border-t border-dark-500 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-nude/60">Total</span>
                  <span className="text-gold font-bold text-xl">
                    Gs. {total.toLocaleString('es-PY')}
                  </span>
                </div>
              </div>

              <a
                href={`https://wa.me/595994442400?text=${whatsappText()}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setTimeout(clearCart, 500)}
                className="btn-gold w-full flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle size={18} />
                Pedir por WhatsApp
              </a>

              <p className="text-nude/30 text-xs text-center mt-3">
                Te contactamos para coordinar envio y pago.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
