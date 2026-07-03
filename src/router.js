// src/router.js

// 1. Define the Guard
export const authGuard = (context) => {
    // Access the global store
    Alpine.store('app').login();
    const isAuth = Alpine.store('app').isLoggedIn;
    
    if (!isAuth && context.path !== '/') {
        Alpine.store('app').addToast("Access Denied: Please login first.", "error");        
        // Redirect back to home
        window.PineconeRouter.navigate('/')
        return false; // Stop the navigation
    }
    return true; // Allow navigation
};
export function initRouter() {
    window.addEventListener('alpine:init', () => {
        window.PineconeRouter.settings.hash = false;
        window.PineconeRouter.settings.basePath = '/';

        // Helper to get nav component instance
        const nav = () => Alpine.$data(document.querySelector('[x-data="navigation"]') 
                       ?? document.body);

        window.PineconeRouter.add('/', {
            handlers: [authGuard, (context) => {
                nav().loadView('/views/signin-signup/auth-login.html');
            }]
        });

        window.PineconeRouter.add('/signup', {
            handlers: [authGuard, (context) => {
                nav().loadView('/views/signin-signup/auth-signup.html');
            }]
        });

        window.PineconeRouter.add('/dashboard', {
            handlers: [authGuard, (context) => {
                nav().loadView('/views/dashboard.html');
            }]
        });

        window.PineconeRouter.add('/customers', {
            handlers: [authGuard, (context) => {
                nav().loadView('/views/customer-list.html');
            }]
        });

        window.PineconeRouter.add('/customer/create', {
            handlers: [authGuard, (context) => {
                nav().loadView('/views/customer-create.html');
            }]
        });

        window.PineconeRouter.add('/sale/create', {
            handlers: [authGuard, (context) => {
                nav().loadView('/views/sale-create.html');
            }]
        });

        window.PineconeRouter.settings.notfound = (context) => {
            console.warn(`404: ${context.path}`);
            nav().currentView = `<div style="padding:40px;text-align:center"><h2>404 — Page not found</h2></div>`;
        };
    });
}
