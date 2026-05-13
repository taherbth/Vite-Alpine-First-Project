// 1. Define the Guard
export const authGuard = (context) => {
    // Access the global store
    Alpine.store('app').login();
    const isAuth = Alpine.store('app').isLoggedIn;
    
    if (!isAuth) {
        Alpine.store('app').addToast("Access Denied: Please login first.", "error");        
        // Redirect back to home
        window.PineconeRouter.navigate('/')
        return false; // Stop the navigation
    }
};

export const initRouter = () => {
    // 1. Attach to window immediately so x-handler doesn't error out
    window.authGuard = authGuard;

    // 2. Wait for Alpine/Pinecone to be ready before touching settings
    document.addEventListener('alpine:init', () => {
        if (window.PineconeRouter) {
            // Updated Settings
            window.PineconeRouter.settings.hash = false;
            window.PineconeRouter.settings.basePath = '/';
            
            // ADD THIS: 404 handler
            window.PineconeRouter.settings.notfound = (context) => {
                console.warn(`404 - Page not found: ${context.path}`);
                // 2. Redirect to the named route 'notfound'
                // This tells Pinecone to look for <template x-route="notfound">
                context.route = 'notfound';
            };

            console.log("Router initialized with 404 handling");
        } else {
            console.error("Pinecone Router plugin not found!");
        }
    });
};
