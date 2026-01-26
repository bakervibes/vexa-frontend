import { MotionPlugin } from '@vueuse/motion'
import { createHead } from '@unhead/vue/client'
import 'flag-icons/css/flag-icons.min.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import 'vue-sonner/style.css'
import App from './App.vue'
import './assets/main.css'
import { setupVueQuery } from './plugins/vue-query'
import router from './router'

// Valide les variables d'environnement au démarrage
// Lance une erreur si la configuration est invalide
import './env'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

// Setup plugins
app.use(pinia) // Important: Pinia avant le router pour que les guards puissent l'utiliser
app.use(router)
app.use(head) // SEO head management
app.use(MotionPlugin)
setupVueQuery(app)

app.mount('#app')
