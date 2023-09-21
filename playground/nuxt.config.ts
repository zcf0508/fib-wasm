// https://nuxt.com/docs/api/configuration/nuxt-config
import * as path from 'node:path'
import { comlink } from 'vite-plugin-comlink'

const resolve = path.resolve

const PROP = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@unocss/nuxt'
  ],
  alias: {
    'fib-wasm': resolve(__dirname, PROP ? '../build/release' : '../build/debug'),
  },
  vite: {
    plugins: [
      comlink(),
    ],
    build: {
      target: 'esnext', // for assemblyscript top-level await
    }
  },
})
