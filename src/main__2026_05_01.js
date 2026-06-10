// src/main.js
import './css/main.css';
import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import persist from '@alpinejs/persist'
import PineconeRouter from 'pinecone-router'

import globalStore from './stores/appStore.js'
import navLogic from './components/nav.js'
import { initRouter } from './router.js'
import contactForm from './components/contactForm.js';
import postsView from './components/postsView.js';

// 1. Assign to window FIRST
window.Alpine = Alpine

// 2. Register plugins
Alpine.plugin(collapse)
Alpine.plugin(persist)
Alpine.plugin(PineconeRouter)

// 3. Register stores & components
Alpine.store('app', globalStore(Alpine));
Alpine.data('navigation', navLogic);
Alpine.data('contactForm', contactForm);
Alpine.data('postsView', postsView);
Alpine.data('appData', () =>({ features: [{title: 'Vite Powered'}]}));

// 4. Initialize router
initRouter()

// 5. Start Alpine last
Alpine.start()