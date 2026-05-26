import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Upload, Search, X, Zap, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORIES } from '../../lib/constants'

const EMPTY_FLASH = {
  name: '', brand: '', description: '', price: '', sale_price: '',
  category: CATEGORIES[0], emoji: '⚡',
  image_url: '', is_active: true, stock: '',
  ends_at: '',
}

const EMOJIS = ['⚡', '🔥', '💥', '🌸', '💄', '✨', '💅', '🌿', '💙', '💋', '🎁', '🧴']

const DEMO_ITEMS = [
  { id: 1, name: 'Perfume Oferta Flash', brand: 'Lattafa', price: 85000, sale_price: 60000, category: 'Perfumes', emoji: '⚡', is_active: true, stock: 5, ends_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
  { id: 2, name: 'Lip Glow Oil', brand: 'DIOR', price: 45000, sale_price: 29000, category: 'Maquillaje', emoji: '💄', is_active: true, stock: 3, ends_at: new Date(Date.now() + 28 * 60 * 1000).toISOString() },
]

function TimeRemaining({ endsAt }) {
  const [remaining, setRemaining] = useState(() =>
    endsAt ? Math.max(0, new Date(endsAt) - new Date()) : null
  )

  useEffect(() => {
    if (!endsAt) return
    const id = setInterval(() => {
      setRemaining(Math.max(0, new Date(endsAt) - new Date()))
    }, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (remaining === null) return <span className="text-nude/30 text-xs">Sin límite</span>
  if (remaining === 0) return <span className="text-red-400 text-xs font-bold">Expirada</span>

  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  const urgent = remaining < 10 * 60 * 1000

  return (
    <span className={`text-xs font-mono font-bold ${urgent ? 'text-red-400' : 'text-orange-400'}`}>
      {h > 0 ? `${h}h ` : ''}{String(m).padStart(2, '0')}m {String(s).padStart(2, '0')}s
    </span>
  )
}

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function AdminFlashSales() {
  const [items, setItems] = useState(DEMO_ITEMS)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FLASH)
  const [search, setSearch] = useState('')
  const imageRef = useRef()
  const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL

  useEffect(() => { if (hasSupabase) fetchItems() }, [])

  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('flash_sales')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setItems(data)
    setLoading(false)
  }

  const openNew = () => { setEditing(null); setForm(EMPTY_FLASH); setShowForm(true) }
  const openEdit = (item) => {
    setEditing(item.id)
    setForm({ ...item, ends_at: toDatetimeLocal(item.ends_at), sale_price: item.sale_price ?? '' })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FLASH) }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!hasSupabase) { toast.error('Configurá Supabase para subir imágenes'); return }
    const ext = file.name.split('.').pop()
    const path = `flash-sales/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) { toast.error('Error subiendo imagen'); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setForm(f => ({ ...f, image_url: data.publicUrl }))
    toast.success('Imagen subida')
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Nombre y precio son obligatorios'); return }

    const payload = {
      name: form.name,
      brand: form.brand || null,
      description: form.description || null,
      price: Number(form.price),
      sale_price: form.sale_price !== '' ? Number(form.sale_price) : null,
      category: form.category || CATEGORIES[0],
      emoji: form.emoji || '⚡',
      image_url: form.image_url || null,
      is_active: form.is_active ?? true,
      stock: Number(form.stock) || 0,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    }

    if (!hasSupabase) {
      if (editing) {
        setItems(prev => prev.map(i => i.id === editing ? { ...payload, id: editing } : i))
      } else {
        setItems(prev => [...prev, { ...payload, id: Date.now() }])
      }
      toast.success(editing ? 'Oferta actualizada' : 'Oferta creada')
      closeForm()
      return
    }

    let error
    if (editing) {
      ({ error } = await supabase.from('flash_sales').update(payload).eq('id', editing))
    } else {
      ({ error } = await supabase.from('flash_sales').insert(payload))
    }
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success(editing ? 'Oferta actualizada' : 'Oferta creada')
    fetchItems()
    closeForm()
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta oferta?')) return
    if (!hasSupabase) { setItems(prev => prev.filter(i => i.id !== id)); toast.success('Eliminada'); return }
    await supabase.from('flash_sales').delete().eq('id', id)
    toast.success('Oferta eliminada')
    fetchItems()
  }

  const toggleActive = async (item) => {
    const newActive = !item.is_active
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: newActive } : i))
    if (hasSupabase) {
      await supabase.from('flash_sales').update({ is_active: newActive }).eq('id', item.id)
    }
    toast.success(newActive ? 'Oferta activada' : 'Oferta desactivada')
  }

  const filtered = items.filter(i =>
    !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.brand?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            <Zap size={20} className="text-orange-400 fill-current" />
            Ofertas Relámpago
          </h2>
          <p className="text-nude/50 text-sm">{items.length} total · {items.filter(i => i.is_active).length} activas</p>
        </div>
        <button
          onClick={openNew}
          className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:from-orange-400 hover:to-red-500 transition-all active:scale-95 shadow-lg shadow-orange-900/30"
        >
          <Plus size={16} /> Nueva oferta
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nude/40" />
        <input
          type="text"
          placeholder="Buscar ofertas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-dark-600 border border-dark-500 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-nude/30 focus:outline-none focus:border-orange-500/50 text-sm"
        />
      </div>

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-500">
              <tr>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3">Oferta</th>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Precio orig.</th>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3">Precio oferta</th>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3 hidden md:table-cell">Tiempo restante</th>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-dark-600 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-nude/40 text-sm">No hay ofertas</td></tr>
              ) : (
                filtered.map(item => {
                  const isExpiredByTimer = item.ends_at && new Date(item.ends_at) <= new Date()
                  const effectivelyActive = item.is_active && !isExpiredByTimer
                  return (
                    <tr key={item.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-dark-600 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.image_url
                              ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                              : <span>{item.emoji || '⚡'}</span>
                            }
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-nude/40 text-xs">{item.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-nude/50 text-sm hidden sm:table-cell">
                        {item.sale_price
                          ? <span className="line-through">Gs. {Number(item.price).toLocaleString('es-PY')}</span>
                          : <span className="text-gold">Gs. {Number(item.price).toLocaleString('es-PY')}</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        {item.sale_price
                          ? <span className="text-orange-400 font-bold text-sm">Gs. {Number(item.sale_price).toLocaleString('es-PY')}</span>
                          : <span className="text-nude/30 text-xs">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="text-nude/30 shrink-0" />
                          <TimeRemaining endsAt={item.ends_at} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(item)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                            effectivelyActive
                              ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                              : 'bg-dark-500 text-nude/40 hover:bg-dark-400'
                          }`}
                          title={isExpiredByTimer ? 'El timer expiró — activá manualmente para reanudar' : (item.is_active ? 'Clic para desactivar' : 'Clic para activar')}
                        >
                          {effectivelyActive
                            ? <><ToggleRight size={13} /> Activa</>
                            : <><ToggleLeft size={13} /> {isExpiredByTimer && item.is_active ? 'Expirada' : 'Inactiva'}</>
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(item)} className="text-nude/40 hover:text-orange-400 transition-colors p-1">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-nude/40 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-dark-700 border-b border-dark-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Zap size={16} className="text-orange-400 fill-current" />
                {editing ? 'Editar oferta' : 'Nueva oferta relámpago'}
              </h3>
              <button onClick={closeForm} className="text-nude/50 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Imagen */}
              <div>
                <label className="text-nude/50 text-xs uppercase tracking-wider block mb-2">Imagen</label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 rounded-xl bg-dark-600 border border-dark-500 flex items-center justify-center overflow-hidden">
                    {form.image_url
                      ? <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-2xl">{form.emoji || '⚡'}</span>
                    }
                  </div>
                  <div>
                    <button onClick={() => imageRef.current?.click()} className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5">
                      <Upload size={12} /> Subir imagen
                    </button>
                    <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="URL de imagen (opcional)"
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white placeholder:text-nude/30 focus:outline-none focus:border-orange-500/50 text-sm"
                />
              </div>

              {/* Emoji */}
              <div>
                <label className="text-nude/50 text-xs uppercase tracking-wider block mb-2">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setForm(f => ({ ...f, emoji: e }))}
                      className={`text-xl p-1.5 rounded-lg border transition-all ${form.emoji === e ? 'border-orange-500 bg-orange-500/10' : 'border-dark-500 hover:border-orange-500/40'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Marca</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Precio original (Gs.) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Precio oferta (Gs.)</label>
                  <input
                    type="number"
                    placeholder="Vacío = sin descuento"
                    value={form.sale_price}
                    onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white placeholder:text-nude/30 focus:outline-none focus:border-orange-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Categoría</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50 text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Temporizador */}
                <div className="col-span-2 bg-dark-600 rounded-xl p-4 border border-dark-500">
                  <label className="text-orange-400 text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 mb-1">
                    <Clock size={12} /> Temporizador
                  </label>
                  <p className="text-nude/40 text-xs mb-3">
                    La oferta se muestra como expirada al llegar a la fecha. Dejalo vacío para desactivación solo manual.
                  </p>
                  <input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50 text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                  {form.ends_at && (
                    <button
                      onClick={() => setForm(f => ({ ...f, ends_at: '' }))}
                      className="mt-2 text-nude/40 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                    >
                      <X size={10} /> Quitar temporizador
                    </button>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50 text-sm resize-none"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-dark-500 peer-checked:bg-orange-500 rounded-full transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </label>
                  <span className="text-nude/60 text-sm">Oferta activa (visible en la tienda)</span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-700 border-t border-dark-500 px-6 py-4 flex gap-3">
              <button onClick={closeForm} className="flex-1 btn-outline text-sm">Cancelar</button>
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:from-orange-400 hover:to-red-500 transition-all active:scale-95"
              >
                {editing ? 'Guardar cambios' : 'Crear oferta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
