import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ComboCreator from './pages/ComboCreator'
import Cart from './pages/Cart'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import { supabase } from './lib/supabase'

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function ProtectedAdmin({ children }) {
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL

  useEffect(() => {
    if (!hasSupabase) {
      // Modo demo sin Supabase
      setAllowed(localStorage.getItem('aura-admin') === 'true')
      setChecking(false)
      return
    }
    // Verificar sesion real de Supabase
    supabase.auth.getSession().then(({ data }) => {
      setAllowed(!!data.session)
      setChecking(false)
    })
    // Escuchar cambios de sesion
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAllowed(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return allowed ? children : <Navigate to="/admin" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/catalogo" element={<PublicLayout><Catalog /></PublicLayout>} />
        <Route path="/combo" element={<PublicLayout><ComboCreator /></PublicLayout>} />
        <Route path="/carrito" element={<PublicLayout><Cart /></PublicLayout>} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
        <Route path="/admin/productos" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>}>
          <Route index element={<AdminProducts />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
