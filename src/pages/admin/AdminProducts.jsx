import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Upload, Search, X, Check, FileText, Palette } from 'lucide-react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { CATEGORIES } from '../../lib/constants'

const EMPTY_PRODUCT = {
  name: '', brand: '', description: '', price: '',
  category: CATEGORIES[0], gender: 'unisex', emoji: '✨',
  image_url: '', is_active: true, stock: '',
  variants: [],
}
const EMPTY_VARIANT = { color_name: '', color_hex: '#c9a874', image_url: '' }
const GENDERS = ['femenino', 'masculino', 'unisex']
const EMOJIS = ['✨', '💄', '🌸', '💅', '🌿', '🌞', '💙', '💋', '🏺', '🎁', '🧴', '🪷']

const DEMO_PRODUCTS = [
  { id: 1, name: 'Perfume Yara Mystical', brand: 'Lattafa', price: 85000, category: 'Perfumes', gender: 'femenino', emoji: '🌸', is_active: true, stock: 15, variants: [] },
  { id: 2, name: 'Lip Glow Oil', brand: 'DIOR', price: 45000, category: 'Maquillaje', gender: 'femenino', emoji: '💄', is_active: true, stock: 8, variants: [] },
  { id: 3, name: 'Disaar HA Cream', brand: 'Disaar', price: 55000, category: 'Skincare', gender: 'unisex', emoji: '✨', is_active: true, stock: 20, variants: [] },
]

export default function AdminProducts() {
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT)
  const [search, setSearch] = useState('')
  const [csvPreview, setCsvPreview] = useState(null)
  const [uploadingVariantImage, setUploadingVariantImage] = useState(false)
  const fileRef = useRef()
  const imageRef = useRef()
  const variantImageRef = useRef()
  const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL

  useEffect(() => { if (hasSupabase) fetchProducts() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (!error && data) setProducts(data)
    setLoading(false)
  }

  const openNew = () => { setEditing(null); setForm(EMPTY_PRODUCT); setVariantForm(EMPTY_VARIANT); setShowForm(true) }
  const openEdit = (p) => {
    setEditing(p.id)
    setForm({ ...p, variants: p.variants || [] })
    setVariantForm(EMPTY_VARIANT)
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_PRODUCT); setVariantForm(EMPTY_VARIANT) }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!hasSupabase) { toast.error('Configura Supabase para subir imagenes'); return }
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) { toast.error('Error subiendo imagen'); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setForm(f => ({ ...f, image_url: data.publicUrl }))
    toast.success('Imagen subida')
  }

  const handleVariantImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!hasSupabase) { toast.error('Configura Supabase para subir imagenes'); return }
    setUploadingVariantImage(true)
    const ext = file.name.split('.').pop()
    const path = `products/variants/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) { toast.error('Error subiendo imagen'); setUploadingVariantImage(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setVariantForm(v => ({ ...v, image_url: data.publicUrl }))
    toast.success('Imagen de variante subida')
    setUploadingVariantImage(false)
  }

  const addVariant = () => {
    if (!variantForm.color_name.trim()) { toast.error('Ingresa el nombre del color'); return }
    const newVariant = {
      id: Date.now().toString(36),
      color_name: variantForm.color_name.trim(),
      color_hex: variantForm.color_hex,
      image_url: variantForm.image_url.trim(),
    }
    setForm(f => ({ ...f, variants: [...(f.variants || []), newVariant] }))
    setVariantForm(EMPTY_VARIANT)
  }

  const removeVariant = (idx) => {
    setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }))
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Nombre y precio son obligatorios'); return }

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      variants: form.variants || [],
    }

    if (!hasSupabase) {
      if (editing) {
        setProducts(prev => prev.map(p => p.id === editing ? { ...payload, id: editing } : p))
      } else {
        setProducts(prev => [...prev, { ...payload, id: Date.now() }])
      }
      toast.success(editing ? 'Producto actualizado' : 'Producto creado')
      closeForm()
      return
    }

    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing)
      if (error) { toast.error('Error al actualizar'); return }
      toast.success('Producto actualizado')
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { toast.error('Error al crear'); return }
      toast.success('Producto creado')
    }
    fetchProducts()
    closeForm()
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    if (!hasSupabase) {
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Producto eliminado')
      return
    }
    await supabase.from('products').delete().eq('id', id)
    toast.success('Producto eliminado')
    fetchProducts()
  }

  const handleCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCsvPreview(result.data)
        toast.success(`${result.data.length} productos listos para importar`)
      },
    })
  }

  const importCSV = async () => {
    if (!csvPreview) return
    const items = csvPreview.map(row => ({
      name: row.nombre || row.name || '',
      brand: row.marca || row.brand || '',
      description: row.descripcion || row.description || '',
      price: Number(row.precio || row.price || 0),
      category: row.categoria || row.category || 'Perfumes',
      gender: row.genero || row.gender || 'unisex',
      emoji: row.emoji || '✨',
      is_active: true,
      stock: Number(row.stock || 0),
      variants: [],
    })).filter(p => p.name && p.price > 0)

    if (!hasSupabase) {
      setProducts(prev => [...prev, ...items.map((p, i) => ({ ...p, id: Date.now() + i }))])
      toast.success(`${items.length} productos importados (demo)`)
      setCsvPreview(null)
      return
    }

    const { error } = await supabase.from('products').insert(items)
    if (error) { toast.error('Error importando CSV'); return }
    toast.success(`${items.length} productos importados`)
    fetchProducts()
    setCsvPreview(null)
  }

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Productos</h2>
          <p className="text-nude/50 text-sm">{products.length} total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5"
          >
            <Upload size={14} /> CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          <button onClick={openNew} className="btn-gold text-sm flex items-center gap-2">
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* CSV Preview */}
      {csvPreview && (
        <div className="card-dark p-4 mb-6 border-gold/30 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-gold" />
              <span className="text-white font-medium text-sm">{csvPreview.length} productos del CSV</span>
            </div>
            <div className="flex gap-2">
              <button onClick={importCSV} className="btn-gold text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Check size={12} /> Importar todos
              </button>
              <button onClick={() => setCsvPreview(null)} className="text-nude/50 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="border-b border-dark-500">
                  {Object.keys(csvPreview[0] || {}).map(k => (
                    <th key={k} className="text-nude/50 text-left pb-2 pr-4 whitespace-nowrap">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-dark-600">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="text-nude/70 py-1.5 pr-4 whitespace-nowrap">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {csvPreview.length > 5 && (
              <p className="text-nude/30 text-xs mt-2">... y {csvPreview.length - 5} mas</p>
            )}
          </div>
          <div className="mt-3 bg-dark-600 rounded-lg p-3">
            <p className="text-nude/40 text-xs font-medium mb-1">Columnas esperadas en el CSV:</p>
            <p className="text-nude/30 text-xs font-mono">nombre, marca, descripcion, precio, categoria, genero, emoji, stock</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nude/40" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-dark-600 border border-dark-500 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-nude/30 focus:outline-none focus:border-gold/50 text-sm"
        />
      </div>

      {/* Table */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-500">
              <tr>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3">Producto</th>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Categoria</th>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3 hidden md:table-cell">Genero</th>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3">Precio</th>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Stock</th>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3 hidden md:table-cell">Colores</th>
                <th className="text-left text-nude/40 text-xs uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-dark-600 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-nude/40 text-sm">No hay productos</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-dark-600/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-dark-600 flex items-center justify-center shrink-0 overflow-hidden">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span>{p.emoji || '✨'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium line-clamp-1">{p.name}</p>
                          <p className="text-nude/40 text-xs">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-nude/60 text-sm hidden sm:table-cell">{p.category}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={
                        p.gender === 'femenino' ? 'badge-fem' :
                        p.gender === 'masculino' ? 'badge-masc' : 'badge-unisex'
                      }>{p.gender}</span>
                    </td>
                    <td className="px-4 py-3 text-gold font-medium text-sm">
                      Gs. {Number(p.price).toLocaleString('es-PY')}
                    </td>
                    <td className="px-4 py-3 text-nude/60 text-sm hidden sm:table-cell">{p.stock}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {(p.variants || []).length > 0 ? (
                        <div className="flex gap-1">
                          {(p.variants || []).slice(0, 5).map((v, i) => (
                            <div
                              key={i}
                              title={v.color_name}
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: v.color_hex }}
                            />
                          ))}
                          {(p.variants || []).length > 5 && (
                            <span className="text-nude/40 text-xs">+{p.variants.length - 5}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-nude/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {p.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-nude/40 hover:text-gold transition-colors p-1">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-nude/40 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-dark-700 border-b border-dark-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-semibold">{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={closeForm} className="text-nude/50 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image */}
              <div>
                <label className="text-nude/50 text-xs uppercase tracking-wider block mb-2">Imagen principal</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-dark-600 border border-dark-500 flex items-center justify-center overflow-hidden">
                    {form.image_url ? (
                      <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{form.emoji || '✨'}</span>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => imageRef.current?.click()}
                      className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5"
                    >
                      <Upload size={12} /> Subir imagen
                    </button>
                    <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <p className="text-nude/30 text-xs mt-1">O pega una URL abajo</p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="URL de imagen (opcional)"
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white placeholder:text-nude/30 focus:outline-none focus:border-gold/50 text-sm mt-2"
                />
              </div>

              {/* Emoji picker */}
              <div>
                <label className="text-nude/50 text-xs uppercase tracking-wider block mb-2">Emoji (si no hay imagen)</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setForm(f => ({ ...f, emoji: e }))}
                      className={`text-xl p-1.5 rounded-lg border transition-all ${form.emoji === e ? 'border-gold bg-gold/10' : 'border-dark-500 hover:border-gold/40'}`}
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
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-gold/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Marca</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-gold/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Precio (Gs.) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-gold/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Categoria</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-gold/50 text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Genero</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-gold/50 text-sm"
                  >
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-gold/50 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-nude/50 text-xs uppercase tracking-wider block mb-1.5">Descripcion</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-dark-600 border border-dark-500 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-gold/50 text-sm resize-none"
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
                    <div className="w-10 h-6 bg-dark-500 peer-checked:bg-gold rounded-full transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </label>
                  <span className="text-nude/60 text-sm">Producto activo (visible en el catalogo)</span>
                </div>
              </div>

              {/* ─── Variaciones de Color ─── */}
              <div className="border-t border-dark-500 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Palette size={16} className="text-gold" />
                  <label className="text-white text-sm font-medium">Variaciones de Color</label>
                  <span className="text-nude/40 text-xs">(opcional)</span>
                </div>

                {/* Existing variants */}
                {(form.variants || []).length > 0 && (
                  <div className="space-y-2 mb-4">
                    {(form.variants || []).map((v, i) => (
                      <div key={i} className="flex items-center gap-3 bg-dark-600 rounded-xl p-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-dark-400 shrink-0"
                          style={{ backgroundColor: v.color_hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{v.color_name}</p>
                          <p className="text-nude/30 text-xs font-mono">{v.color_hex}</p>
                        </div>
                        {v.image_url && (
                          <img
                            src={v.image_url}
                            alt={v.color_name}
                            className="w-10 h-10 rounded-lg object-cover border border-dark-400 shrink-0"
                          />
                        )}
                        {!v.image_url && (
                          <div className="w-10 h-10 rounded-lg bg-dark-500 border border-dark-400 flex items-center justify-center shrink-0">
                            <span className="text-nude/30 text-xs">Sin img</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeVariant(i)}
                          className="text-nude/30 hover:text-red-400 transition-colors p-1 shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add variant form */}
                <div className="bg-dark-600 rounded-xl p-4 space-y-3">
                  <p className="text-nude/50 text-xs uppercase tracking-wider">Agregar color</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del color (ej: Rosa, Nude, Rojo)"
                      value={variantForm.color_name}
                      onChange={e => setVariantForm(v => ({ ...v, color_name: e.target.value }))}
                      className="flex-1 bg-dark-500 border border-dark-400 rounded-lg px-3 py-2 text-white placeholder:text-nude/30 focus:outline-none focus:border-gold/50 text-sm"
                    />
                    <div className="relative shrink-0" title="Elegir color">
                      <input
                        type="color"
                        value={variantForm.color_hex}
                        onChange={e => setVariantForm(v => ({ ...v, color_hex: e.target.value }))}
                        className="w-10 h-10 rounded-lg border border-dark-400 cursor-pointer p-0.5 bg-dark-500"
                        style={{ backgroundColor: variantForm.color_hex }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="URL de imagen para este color (opcional)"
                      value={variantForm.image_url}
                      onChange={e => setVariantForm(v => ({ ...v, image_url: e.target.value }))}
                      className="flex-1 bg-dark-500 border border-dark-400 rounded-lg px-3 py-2 text-white placeholder:text-nude/30 focus:outline-none focus:border-gold/50 text-sm"
                    />
                    <button
                      onClick={() => variantImageRef.current?.click()}
                      disabled={uploadingVariantImage}
                      className="btn-outline text-xs px-3 py-2 flex items-center gap-1 shrink-0 disabled:opacity-50"
                    >
                      <Upload size={12} />
                      {uploadingVariantImage ? '...' : 'Img'}
                    </button>
                    <input
                      ref={variantImageRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleVariantImageUpload}
                    />
                  </div>

                  {variantForm.image_url && (
                    <div className="flex items-center gap-2">
                      <img
                        src={variantForm.image_url}
                        alt="preview"
                        className="w-12 h-12 rounded-lg object-cover border border-dark-400"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                      <span className="text-nude/40 text-xs">Vista previa</span>
                    </div>
                  )}

                  <button
                    onClick={addVariant}
                    disabled={!variantForm.color_name.trim()}
                    className="btn-gold text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={12} /> Agregar este color
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-700 border-t border-dark-500 px-6 py-4 flex gap-3">
              <button onClick={closeForm} className="flex-1 btn-outline text-sm">Cancelar</button>
              <button onClick={handleSave} className="flex-1 btn-gold text-sm">
                {editing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
