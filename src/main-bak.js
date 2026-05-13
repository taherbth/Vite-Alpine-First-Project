// src/main.js
import './css/main.css'
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

// Legacy Plugins
import './js/plugins.js';
import './js/datatables.js';
import './js/pages.js';
import './js/page-level.js';

// Modern Libraries
import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'
import collapse from '@alpinejs/collapse'
import PineconeRouter from 'pinecone-router'

// Code Logic
import globalStore from './stores/appStore.js'
import navLogic from './components/nav.js'
// Import our new router logic
import { initRouter } from './router.js'
import contactForm from './components/contactForm.js';
import postsView from './components/postsView.js';


// 1. Assign to window IMMEDIATELY
window.Alpine = Alpine

// 2. Register plugins immediately
Alpine.plugin(collapse)
Alpine.plugin(persist)
Alpine.plugin(PineconeRouter)

// 3. Register Stores & Data
Alpine.store('app', globalStore(Alpine));

Alpine.data('navigation', navLogic)
Alpine.data('contactForm', contactForm);
Alpine.data('postsView', postsView);

 

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
    // Register Data
    Alpine.data('appData', () => ({
        features: [{ title: 'Vite Powered' }]
    }));

// 3. Initialize Router (This sets the settings you defined in router.js)
initRouter()
// 4. Start Alpine last
Alpine.start()