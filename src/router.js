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
            window.PineconeRouter.settings.hash = false;
            window.PineconeRouter.settings.basePath = '/';
            console.log("Router initialized successfully");
        } else {
            console.error("Pinecone Router plugin not found!");
        }
    });
};
