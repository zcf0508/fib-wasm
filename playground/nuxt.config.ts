// https://nuxt.com/docs/api/configuration/nuxt-config
import * as path from 'node:path'

const resolve = path.resolve

const PROP = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  devtools: { enabled: false },
  alias: {
    'fib-wasm': resolve(__dirname, PROP ? '../build/release' : '../build/debug'),
  },
  vite: {
    build: {
      target: 'esnext', // for assemblyscript top-level await
    }
  },
})
