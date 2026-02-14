import './css/main.css'
import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'
import PineconeRouter from 'pinecone-router'
import globalStore from './stores/appStore.js'
import navLogic from './components/nav.js'
// Import our new router logic
import { initRouter } from './router.js'
import contactForm from './components/contactForm.js';
import postsView from './components/postsView.js';

// 1. Register plugins immediately
Alpine.plugin(persist)
Alpine.plugin(PineconeRouter)

Alpine.data('contactForm', contactForm);
Alpine.data('postsView', postsView);

// 2. Assign to window so Pinecone can find it
window.Alpine = Alpine

// 3. This event is the ONLY place to safely configure Pinecone in Vite
// document.addEventListener('alpine:init', () => {
//     // Force settings
//     // window.PineconeRouter.settings.hash = false;
//     // window.PineconeRouter.settings.basePath = '';
    
//     // Register Store
//     Alpine.store('app', globalStore(Alpine));
    
//     // Register Data
//     Alpine.data('navigation', navLogic);
//     Alpine.data('appData', () => ({
//         features: [{ title: 'Vite Powered' }]
//     }));
// });

// Register Store
    Alpine.store('app', globalStore(Alpine));
    
    // Register Data
    Alpine.data('navigation', navLogic);
    Alpine.data('appData', () => ({
        features: [{ title: 'Vite Powered' }]
    }));

// 3. Initialize Router (This sets the settings you defined in router.js)
initRouter()
// 4. Start Alpine last
Alpine.start()