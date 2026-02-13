import './css/main.css'
import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'
import PineconeRouter from 'pinecone-router'
import globalStore from './stores/appStore.js'
import navLogic from './components/nav.js'
// Import our new router logic
import { initRouter } from './router.js'

window.Alpine = Alpine
// Register Store
Alpine.store('app', globalStore(Alpine));
// Initialize Router Settings & Guards
initRouter()
// 4. Start Alpine last
Alpine.start()