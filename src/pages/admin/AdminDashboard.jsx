import { useState, useEffect } from 'react'
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, LogOut, Menu, X, ExternalLink, BarChart3, CheckCircle, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/flash-sales', label: 'Ofertas Relámpago', icon: Zap },
]

function StatCard({ label, value, sub, color = 'gold' }) {
  const configs = {
    gold: { border: 'border-gold/30', bg: 'bg-gradient-to-br from-gold/15 to-gold/5', text: 'text-gold' },
    sage: { border: 'border-sage/30', bg: 'bg-gradient-to-br from-sage/15 to-sage/5', text: 'text-sage-light' },
    nude: { border: 'border-nude/30', bg: 'bg-gradient-to-br from-nude/15 to-nude/5', text: 'text-nude' },
  }
  const c = configs[color]
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5 shadow-lg`}>
      <p className="text-white/50 text-xs uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-4xl font-display font-light ${c.text}`}>{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1.5">{sub}</p>}
    </div>
  )
}

function DashboardHome() {
  const [stats, setStats] = useState({ total: '—', activos: '—', inactivos: '—' })
  const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL

  useEffect(() => {
    if (!hasSupabase) return
    const fetchStats = async () => {
      const { data } = await supabase.from('products').select('is_active')
      if (data) {
        setStats({
          total: data.length,
          activos: data.filter(p => p.is_active).length,
          inactivos: data.filter(p => !p.is_active).length,
        })
      }
    }
    fetchStats()
  }, [])

  const steps = [
    { title: 'Cuenta Supabase creada', done: hasSupabase },
    { title: 'Credenciales en .env', done: hasSupabase },
    { title: 'SQL ejecutado en Supabase', done: hasSupabase },
    { title: 'Carga tus productos reales', done: typeof stats.total === 'number' && stats.total > 0, desc: 'Usa el formulario o importa un CSV desde Productos' },
  ]

  return (
    <div>
      <h2 className="text-white text-xl font-semibold mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Productos totales" value={stats.total} sub={hasSupabase ? 'en Supabase' : 'demo'} color="gold" />
        <StatCard label="Activos" value={stats.activos} sub="visibles en la tienda" color="sage" />
        <StatCard label="Inactivos" value={stats.inactivos} sub="ocultos" color="nude" />
      </div>

      {/* Setup checklist */}
      <div className="card-dark p-6 border-gold/10 mb-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-gold" />
          Estado de la tienda
        </h3>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${step.done ? 'bg-green-500/10' : 'bg-dark-600'}`}>
              <CheckCircle size={16} className={`shrink-0 mt-0.5 ${step.done ? 'text-green-400' : 'text-dark-400'}`} />
              <div>
                <p className={`text-sm font-medium ${step.done ? 'text-green-300' : 'text-white'}`}>{step.title}</p>
                {step.desc && <p className="text-nude/40 text-xs">{step.desc}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <Link to="/admin/productos" className="btn-gold text-xs flex items-center gap-1.5">
            <Package size={12} /> Ir a Productos
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-outline text-xs flex items-center gap-1.5">
            <ExternalLink size={12} /> Ver tienda
          </a>
        </div>
      </div>

      {/* Quick guide */}
      <div className="bg-gradient-to-br from-dark-700 to-dark-800 border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Como usar el admin</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: '➕', title: 'Agregar producto', desc: 'Productos → "Nuevo producto" → completa el formulario con nombre, precio, imagen y categoria.', color: 'from-gold/10 border-gold/20' },
            { emoji: '📋', title: 'Importar CSV', desc: 'Productos → boton "CSV" → selecciona tu archivo Excel exportado como CSV.', color: 'from-sage/10 border-sage/20' },
            { emoji: '✏️', title: 'Editar / Eliminar', desc: 'En la tabla de productos, usa el lapiz para editar o el tacho para eliminar.', color: 'from-nude/10 border-nude/20' },
          ].map(item => (
            <div key={item.title} className={`bg-gradient-to-br ${item.color} border rounded-xl p-4`}>
              <div className="text-2xl mb-3">{item.emoji}</div>
              <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
              <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isDashboardRoot = location.pathname === '/admin/dashboard'

  const handleLogout = async () => {
    localStorage.removeItem('aura-admin')
    if (import.meta.env.VITE_SUPABASE_URL) await supabase.auth.signOut()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-dark-800 border-r border-dark-600 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="p-5 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-gold/30 overflow-hidden">
              <img src="/logo.jpeg" alt="Aura Poty" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Aura Poty</p>
              <p className="text-nude/40 text-xs">Panel Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.to
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-nude/60 hover:text-white hover:bg-dark-600'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-600 space-y-1">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-nude/50 hover:text-white text-sm transition-colors px-3 py-2 rounded-xl hover:bg-dark-600">
            <ExternalLink size={14} /> Ver tienda
          </a>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-nude/50 hover:text-red-400 text-sm transition-colors px-3 py-2 w-full rounded-xl hover:bg-dark-600">
            <LogOut size={14} /> Cerrar sesion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-dark-600 bg-dark-800 flex items-center px-4 gap-4 lg:px-6 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-nude/50 hover:text-white">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-white font-medium text-sm">
            {location.pathname === '/admin/dashboard' ? 'Dashboard'
              : location.pathname === '/admin/flash-sales' ? 'Ofertas Relámpago'
              : 'Productos'}
          </span>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {isDashboardRoot ? <DashboardHome /> : <Outlet />}
        </main>
      </div>
    </div>
  )
}
