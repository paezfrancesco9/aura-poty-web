import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    // Modo demo: acceso sin Supabase configurado
    if (!import.meta.env.VITE_SUPABASE_URL) {
      if (email === 'admin@aurapoty.com' && password === 'admin123') {
        localStorage.setItem('aura-admin', 'true')
        navigate('/admin/dashboard')
        return
      }
      toast.error('Credenciales incorrectas')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Credenciales incorrectas')
    } else {
      navigate('/admin/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-gold/30 mx-auto mb-4 overflow-hidden">
            <img src="/logo.jpeg" alt="Aura Poty" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display text-3xl text-white">Panel Admin</h1>
          <p className="text-nude/50 text-sm mt-1">Aura Poty</p>
        </div>

        <form onSubmit={handleLogin} className="card-dark p-6 space-y-4">
          <div>
            <label className="text-nude/60 text-xs uppercase tracking-wider block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@aurapoty.com"
              required
              className="w-full bg-dark-600 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder:text-nude/30 focus:outline-none focus:border-gold/50 text-sm"
            />
          </div>

          <div>
            <label className="text-nude/60 text-xs uppercase tracking-wider block mb-2">Contrasena</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                required
                className="w-full bg-dark-600 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder:text-nude/30 focus:outline-none focus:border-gold/50 text-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-nude/40 hover:text-white"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock size={16} />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          {!import.meta.env.VITE_SUPABASE_URL && (
            <div className="bg-gold/10 border border-gold/20 rounded-xl p-3 mt-2">
              <p className="text-gold text-xs text-center font-medium">Modo demo</p>
              <p className="text-nude/50 text-xs text-center">admin@aurapoty.com / admin123</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
