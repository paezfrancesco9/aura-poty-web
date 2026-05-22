import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, Sparkles, Heart, Clock } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import FavoritesPanel from '../ui/FavoritesPanel'
import RecentlyViewedPanel from '../ui/RecentlyViewedPanel'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const location = useLocation()
  const count = useCartStore(s => s.count())
  const favCount = useFavoritesStore(s => s.count())

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setOpen(false), [location])

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catalogo' },
    { to: '/combo', label: 'Crea tu Combo' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden group-hover:border-gold transition-colors">
                <img src="/logo.jpeg" alt="Aura Poty" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-xl text-white font-medium tracking-wide">Aura Poty</span>
                <p className="text-white/40 text-xs tracking-widest">BEAUTY STORE</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {links.map(link => (
                <Link key={link.to} to={link.to}
                  className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                    location.pathname === link.to ? 'text-gold' : 'text-white/70 hover:text-white'
                  }`}>
                  {link.to === '/combo' ? (
                    <span className="inline-flex items-center gap-1">
                      <Sparkles size={14} className="text-gold" />
                      {link.label}
                    </span>
                  ) : link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {/* Favoritos */}
              <button
                onClick={() => setShowFavorites(true)}
                className="relative p-2 text-white/70 hover:text-white transition-colors"
                title="Mis favoritos"
              >
                <Heart size={22} />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {favCount > 9 ? '9+' : favCount}
                  </span>
                )}
              </button>

              {/* Carrito */}
              <Link to="/carrito" className="relative p-2 text-white/70 hover:text-white transition-colors">
                <ShoppingCart size={22} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-dark-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>

              <button className="md:hidden p-2 text-white/70 hover:text-white" onClick={() => setOpen(!open)}>
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="md:hidden glass border-t border-white/10 animate-fade-in">
            <div className="px-4 py-4 flex flex-col gap-1">
              {links.map(link => (
                <Link key={link.to} to={link.to}
                  className={`text-sm font-medium py-3 px-2 border-b border-white/10 ${
                    location.pathname === link.to ? 'text-gold' : 'text-white/70'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Botón flotante — vistos recientemente */}
      <button
        onClick={() => setShowRecent(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-dark-800 border border-white/20 hover:border-gold/50 rounded-full flex items-center justify-center text-white/50 hover:text-gold shadow-lg shadow-black/50 transition-all duration-200 hover:scale-105 active:scale-95"
        title="Vistos recientemente"
      >
        <Clock size={20} />
      </button>

      {showFavorites && <FavoritesPanel onClose={() => setShowFavorites(false)} />}
      {showRecent && <RecentlyViewedPanel onClose={() => setShowRecent(false)} />}
    </>
  )
}
