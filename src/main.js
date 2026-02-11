import './css/main.css'
import Alpine from 'alpinejs'
import PineconeRouter from 'pinecone-router'
import persist from '@alpinejs/persist' // 1. Import the plugin
import globalStore from './stores/appStore.js' // 2. Import the Store

// Import assets directly so Vite tracks them
import heroImageUrl from './bd.jpg' 
import { formatDate } from './utils/helpers.js'; // Import specific logic
import navLogic from './components/nav.js';

window.Alpine = Alpine // This should very begining
Alpine.plugin(PineconeRouter)
Alpine.plugin(persist) // 1. Register it FIRST
Alpine.store('app', globalStore(Alpine)) // // 2. Register it then

// Register the component globally
Alpine.data('navigation', navLogic);
// Register 'app' as the global store name

// Use the imported function
console.log(formatDate(new Date()));

Alpine.data('appData', () => ({
    assets: {
        hero: heroImageUrl
    },
    features: [
        { title: 'Vite Powered', desc: 'Instant Hot Module Replacement (HMR).' },
        { title: 'Bundled Assets', desc: 'Automatic image optimization.' }
    ]
}))

Alpine.start()
