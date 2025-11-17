import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupVueQuery } from './plugins/vue-query'
import './assets/main.css'

// Valide les variables d'environnement au démarrage
// Lance une erreur si la configuration est invalide
import './env'

const app = createApp(App)

// Setup plugins
app.use(router)
setupVueQuery(app)

app.mount('#app')
