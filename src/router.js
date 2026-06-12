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

// src/router.js

export function initRouter__bak() {
    // 1. Basic Settings
    window.PineconeRouter.settings.hash = false;
    window.PineconeRouter.settings.basePath = '/';

    // 2. Add routes one by one using the .add() method
    // This ensures the internal Map stays healthy
    
    window.PineconeRouter.add('/', {
        handler: (context) => {
            console.log('Home page loaded');
        }
    });

    window.PineconeRouter.add('/dashboard', {
        handlers: [window.authGuard, (context) => {
            console.log('Dashboard loaded');
        }]
    });

    window.PineconeRouter.add('/customer', {
        handlers: [window.authGuard, (context) => {
            console.log('Customers loaded');
        }]
    });

    // 3. Add the 404/Not Found handler correctly
    window.PineconeRouter.settings.notfound = (context) => {
        console.warn(`404: ${context.path}`);
        context.route = 'notfound';
    };
}

export function initRouter() {
    window.addEventListener('alpine:init', () => {
        window.PineconeRouter.settings.hash = false;
        window.PineconeRouter.settings.basePath = '/';

        // Helper to get nav component instance
        const nav = () => Alpine.$data(document.querySelector('[x-data="navigation"]') 
                       ?? document.body);

        window.PineconeRouter.add('/', {
            handler: (context) => {
                nav().loadView('/views/dashboard.html');
            }
        });

        window.PineconeRouter.add('/dashboard', {
            handlers: [authGuard, (context) => {
                nav().loadView('/views/dashboard.html');
            }]
        });

        window.PineconeRouter.add('/customer', {
            handlers: [authGuard, (context) => {
                nav().loadView('/views/customer-list.html');
            }]
        });

        window.PineconeRouter.add('/frontend/customer/create', {
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
