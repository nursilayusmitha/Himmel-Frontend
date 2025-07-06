import './assets/css/satoshi.css'
import './assets/css/style.css'
import 'jsvectormap/dist/jsvectormap.min.css'
import 'flatpickr/dist/flatpickr.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import { VueQrcodeReader } from 'vue-qrcode-reader'

import App from './App.vue'
import router from './router'

// Import store untuk dark mode
import { useDarkModeStore } from '@/stores/darkMode'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueQrcodeReader)
app.use(VueApexCharts)

const darkStore = useDarkModeStore()
document.documentElement.classList.toggle('dark', darkStore.darkMode)

app.mount('#app')
