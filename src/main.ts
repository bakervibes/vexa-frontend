import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'

// Valide les variables d'environnement au démarrage
// Lance une erreur si la configuration est invalide
import './env'

createApp(App).mount('#app')
