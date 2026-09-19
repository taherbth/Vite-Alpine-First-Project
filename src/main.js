// src/main.js
import './css/main.css';
/*@import "flatpickr/dist/flatpickr.min.css";*/
import "flatpickr/dist/themes/material_blue.css";
import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import persist from '@alpinejs/persist'
import PineconeRouter from 'pinecone-router'
import datePicker from './components/datePicker.js';

import globalStore from './stores/appStore.js'
import navLogic from './components/nav.js'
import { initRouter } from './router.js'
import contactForm from './components/contactForm.js';
import postsView from './components/postsView.js';
import customerTable from './components/customerTable.js';
import customerCreate from './components/customerCreate.js';
import customerEdit from './components/customerEdit.js';
import { formatDate, formatToTextDate } from './utils/helpers.js';

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

Alpine.data('customerTable', customerTable);
Alpine.data('customerCreate', customerCreate);
Alpine.data('customerEdit', customerEdit);
Alpine.data('datePicker', datePicker);

Alpine.magic('formatDate', () => (date, fallback) => formatDate(date, fallback));

Alpine.magic('formatToTextDate', () => (date, fallback) => formatToTextDate(date, fallback));

// 4. Initialize router
initRouter()

// 5. Start Alpine last
Alpine.start()