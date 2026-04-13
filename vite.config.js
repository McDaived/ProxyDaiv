import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set this to your GitHub repo name (e.g. '/ProxyDaiv/')
// If the site is at https://username.github.io/ProxyDaiv/ → base = '/ProxyDaiv/'
// If the site is at https://username.github.io/            → base = '/'
const BASE = '/ProxyDaiv/'

export default defineConfig({
  plugins: [react()],
  base: BASE,
})
