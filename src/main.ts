import Aura from '@primeuix/themes/aura'
import { MotionPlugin } from '@vueuse/motion'
import 'flag-icons/css/flag-icons.min.css'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import 'vue-sonner/style.css'
import App from './App.vue'
import './assets/main.css'
import { setupVueQuery } from './plugins/vue-query'
import router from './router'
import { useAuthStore } from './stores/auth'

// Valide les variables d'environnement au démarrage
// Lance une erreur si la configuration est invalide
import './env'

const app = createApp(App)
const pinia = createPinia()

// Setup plugins
app.use(pinia) // Important: Pinia avant le router pour que les guards puissent l'utiliser
app.use(router)
app.use(MotionPlugin)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})
setupVueQuery(app)

// Initialiser l'authentification au démarrage
const authStore = useAuthStore()
authStore.checkAuth()

app.mount('#app')
