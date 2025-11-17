import { MotionPlugin } from '@vueuse/motion'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import { setupVueQuery } from './plugins/vue-query'
import router from './router'

// Valide les variables d'environnement au démarrage
// Lance une erreur si la configuration est invalide
import './env'

const app = createApp(App)

// Setup plugins
app.use(router)
app.use(MotionPlugin)
setupVueQuery(app)

app.mount('#app')
