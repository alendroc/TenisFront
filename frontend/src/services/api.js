import axios from 'axios'

const api = axios.create({
  baseURL: '/api',  // gracias al proxy de Vite
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

export default api