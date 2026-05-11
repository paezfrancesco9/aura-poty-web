import { Link } from 'react-router-dom'
import { MessageCircle, MapPin } from 'lucide-react'

function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                <img src="/logo.jpeg" alt="Aura Poty" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-display text-xl text-white">Aura Poty</span>
                <p className="text-white/40 text-xs tracking-widest">BEAUTY STORE</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Productos de belleza de calidad. Perfumes, maquillaje y skincare para vos y los tuyos.
              Envios a todo el pais.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Navegacion</h4>
            <div className="flex flex-col gap-2">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/catalogo', label: 'Catalogo' },
                { to: '/combo', label: 'Crea tu Combo' },
                { to: '/carrito', label: 'Carrito' },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  className="text-white/50 hover:text-gold text-sm transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Contacto</h4>
            <div className="flex flex-col gap-3">
              <a href="https://wa.me/595994442400" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/50 hover:text-green-400 text-sm transition-colors">
                <MessageCircle size={16} />
                WhatsApp: +595 994 442 400
              </a>
              <a href="https://instagram.com/aurapoty_py" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/50 hover:text-pink-400 text-sm transition-colors">
                <InstagramIcon size={16} />
                @aurapoty_py
              </a>
              <span className="flex items-center gap-2 text-white/50 text-sm">
                <MapPin size={16} />
                Paraguay — Envios a todo el pais
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 mt-10 pt-6 text-center text-white/25 text-xs">
          © {new Date().getFullYear()} Aura Poty. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
