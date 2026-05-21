import { Link } from 'react-router-dom'
import { Sparkles, Package, ChevronRight, Star, Truck, ShieldCheck } from 'lucide-react'
import { CATEGORIES, CATEGORY_META } from '../lib/constants'

const categories = [
  ...CATEGORIES.map(name => ({
    name,
    emoji: CATEGORY_META[name]?.emoji ?? '✨',
    desc: CATEGORY_META[name]?.desc ?? '',
    to: `/catalogo?cat=${name}`,
  })),
  { name: 'Combos', emoji: '🎁', desc: 'Arma tu combo personalizado', to: '/combo' },
]

const features = [
  { icon: Truck, title: 'Envios a todo el pais', desc: 'Llegamos donde vos estes en Paraguay' },
  { icon: ShieldCheck, title: 'Productos originales', desc: 'Calidad garantizada en cada compra' },
  { icon: Star, title: 'Los mejores precios', desc: 'Accesibles para todos' },
]

export default function Home() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,116,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(143,172,138,0.08),transparent_60%)]" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-sage/5 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white/5 border border-gold/30 p-2 animate-float">
              <img src="/logo.jpeg" alt="Aura Poty" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          <p className="text-gold/80 text-xs tracking-widest uppercase mb-4 animate-fade-in">Bienvenida a</p>

          <h1 className="font-display text-6xl md:text-8xl text-white font-light tracking-wide mb-4 animate-slide-up">
            Aura <span className="text-gradient">Poty</span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed animate-fade-in">
            Perfumes, maquillaje y skincare de calidad. <br />
            Todo lo que necesitas para brillar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/catalogo" className="btn-gold text-base flex items-center gap-2 justify-center">
              Ver Catalogo <ChevronRight size={18} />
            </Link>
            <Link to="/combo" className="btn-outline text-base flex items-center gap-2 justify-center">
              <Sparkles size={18} /> Crea tu Combo
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-px h-12 bg-gradient-to-b from-gold/50 to-transparent mx-auto" />
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-gold/70 text-xs tracking-widest uppercase mb-3">Lo que encontras</p>
          <h2 className="font-display text-4xl md:text-5xl text-white font-light tracking-wide">Nuestras Categorias</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map(cat => (
            <Link
              key={cat.name}
              to={cat.to}
              className="bg-dark-700 border border-white/10 rounded-2xl p-6 text-center group hover:scale-105 hover:border-gold/50 transition-all duration-300"
            >
              <div className="text-4xl mb-3 group-hover:animate-float inline-block">{cat.emoji}</div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-gold transition-colors">{cat.name}</h3>
              <p className="text-white/50 text-xs">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Combo CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-800 to-dark-700 border-y border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,116,0.08),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold/70 text-xs tracking-widest uppercase mb-3">Nuevo</p>
              <h2 className="font-display text-4xl md:text-5xl text-white font-light tracking-wide mb-6">
                Crea tu <span className="text-gradient">Combo</span> Perfecto
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Elegis los productos que queres, los arrastras a tu caja, bolsa o mesita
                y ves el precio total en tiempo real. Arma tu combo regalo ideal.
              </p>
              <Link to="/combo" className="btn-gold inline-flex items-center gap-2">
                <Sparkles size={18} /> Probar ahora
              </Link>
            </div>

            <div className="relative h-64 flex items-center justify-center">
              <div className="absolute w-48 h-48 bg-gold/5 rounded-3xl border border-gold/20 flex items-center justify-center">
                <Package size={64} className="text-gold/40" />
              </div>
              {['💄', '🌸', '✨', '🎁'].map((emoji, i) => (
                <div key={i} className="absolute text-2xl animate-float"
                  style={{ top: `${20 + i * 20}%`, left: `${10 + i * 22}%`, animationDelay: `${i * 0.5}s` }}>
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(f => (
            <div key={f.title} className="flex items-start gap-4 p-6 bg-dark-700 border border-white/10 rounded-2xl">
              <div className="bg-gold/10 p-3 rounded-xl shrink-0">
                <f.icon size={24} className="text-gold" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                <p className="text-white/50 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
