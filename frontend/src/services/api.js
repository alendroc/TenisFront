import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://stryde-backend-production-dbbb.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
  
// ── Home ───────────────────────────────────────────────
export const getHome = () => api.get('/')

// ── Categorías ──────────────────────────────────────────
export const getCategorias = (params) => api.get('/categorias', { params })
export const getCategoria = (id, params) => api.get(`/categorias/${id}`, { params })
export const crearCategoria = (data) => api.post('/admin/categorias', data)
export const actualizarCategoria = (id, data) => api.put(`/admin/categorias/${id}`, data)
export const eliminarCategoria = (id) => api.delete(`/admin/categorias/${id}`)

// ── Zapatos ─────────────────────────────────────────────
export const getZapato = (id) => api.get(`/productos/${id}`)
export const buscarZapatos = (params) => api.get('/buscar', { params })
export const getZapatosAdmin = (params) => api.get('/admin/zapatos', { params })
export const crearZapato = (data) => api.post('/admin/zapatos', data)
export const actualizarZapato = (id, data) => api.put(`/admin/zapatos/${id}`, data)
export const eliminarZapato = (id) => api.delete(`/admin/zapatos/${id}`)

// ── Marcas ──────────────────────────────────────────────
export const getMarcas = () => api.get('/admin/marcas')
export const crearMarca = (data) => api.post('/admin/marcas', data)
export const actualizarMarca = (id, data) => api.put(`/admin/marcas/${id}`, data)
export const eliminarMarca = (id) => api.delete(`/admin/marcas/${id}`)

// ── Imágenes y Tallas ────────────────────────────────────
export const subirImagen = (zapatoId, data) => api.post(`/admin/zapatos/${zapatoId}/imagenes`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const eliminarImagen = (id) => api.delete(`/admin/imagenes/${id}`)
export const crearTalla = (zapatoId, data) => api.post(`/admin/zapatos/${zapatoId}/tallas`, data)
export const actualizarTalla = (id, data) => api.put(`/admin/tallas/${id}`, data)
export const eliminarTalla = (id) => api.delete(`/admin/tallas/${id}`)

export default api