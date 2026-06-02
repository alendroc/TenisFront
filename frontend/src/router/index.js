import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Públicas
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/categorias',
      name: 'categorias',
      component: () => import('@/views/CategoriasView.vue'),
    },
    {
      path: '/categorias/:id',
      name: 'categorias.show',
      component: () => import('@/views/CategoriaDetalleView.vue'),
    },
    {
      path: '/productos/:id',
      name: 'productos.show',
      component: () => import('@/views/ProductoView.vue'),
    },
    {
      path: '/buscar',
      name: 'buscar',
      component: () => import('@/views/BuscarView.vue'),
    },

    // Admin
    {
      path: '/admin/zapatos',
      name: 'admin.zapatos',
      component: () => import('@/views/admin/ZapatosView.vue'),
    },
    {
      path: '/admin/zapatos/crear',
      name: 'admin.zapatos.crear',
      component: () => import('@/views/admin/ZapatoFormView.vue'),
    },
    {
      path: '/admin/zapatos/:id/editar',
      name: 'admin.zapatos.editar',
      component: () => import('@/views/admin/ZapatoFormView.vue'),
    },
    {
      path: '/admin/categorias',
      name: 'admin.categorias',
      component: () => import('@/views/admin/CategoriasAdminView.vue'),
    },
    {
      path: '/admin/marcas',
      name: 'admin.marcas',
      component: () => import('@/views/admin/MarcasAdminView.vue'),
    },
  ],
})

export default router