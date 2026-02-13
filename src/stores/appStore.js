// src/store.js
export default (Alpine) => ({
    // We use Alpine.$persist() to wrap the initial value.
    // Alpine will now automatically sync 'theme' with localStorage['_x_theme'] 
    theme: Alpine.$persist('light').as('app-theme'),
    isLoggedIn: Alpine.$persist(false), // Persist so they stay logged in on refresh
    // theme: "light",
    posts: [],
    isLoading: false,

    user: { name: 'Guest' },
    
    login() {
        this.isLoggedIn = true;
        this.user.name = 'John Doe';
        this.addToast("Signed in!", "success");
    },
    
    logout() {
        this.isLoggedIn = false;
        this.user.name = 'Guest';
        window.PineconeRouter.navigate('/'); // Redirect to home
    }, 
    toasts: [], // Array to hold active notifications

    apiUrl: import.meta.env.VITE_API_URL,

    // addToast(message, type = 'error') {
    //     const id = Date.now();
    //     this.toasts.push({ id, message, type });

    //     // Auto-remove after 4 seconds
    //     setTimeout(() => {
    //         this.toasts = this.toasts.filter(t => t.id !== id);
    //     }, 4000);
    // },
    // This runs automatically when Alpine.store('app', ...) is called
    async init() {
        // await this.fetchPosts();
        // Listen for route changes
        window.addEventListener('route-changed', () => {
            this.toasts = []; // Clear errors when switching pages
            console.log('Navigated to:', window.location.pathname);
        });
    }, 

    addToast(message, type = 'error', action = null) {
        const id = Date.now();
        // We create the object here. Ensure 'action' is not undefined.
        const newToast = { id, message, type, action };
        
        this.toasts.push(newToast);

        // Only auto-hide if there is NO retry button (so the user has time to click)
        // if (!action) {
        //     setTimeout(() => {
        //         this.toasts = this.toasts.filter(t => t.id !== id);
        //     }, 5000);
        // }
        // Auto-remove success toasts, but let error toasts stay for manual dismissal
        if (type === 'success') {
            setTimeout(() => this.removeToast(id), 5000);
        }
    },
    removeToast(id) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    },
      
    // async fetchPosts() {
    //     this.isLoading = true;
    //     // Create a timer promise (e.g., 800ms)
    //     const timer = new Promise(resolve => setTimeout(resolve, 800));
    //     try {
    //         const fetchPromise = await fetch(`${this.apiUrl}/posts?_limit=5`);
    //         // MAGIC PART: We wait for BOTH to finish
    //         // This ensures the spinner stays for at least 800ms
    //         const [response] = await Promise.all([fetchPromise, timer]);
    //         if (!response.ok) throw new Error('Network response was not ok');
    //         this.posts = await response.json();
    //     } catch (error) {
    //         // Pass the function itself as the 'action'
    //         this.addToast("Failed to sync data.", () => this.fetchPosts());
    //     } finally {
    //         this.isLoading = false;
    //         // Use our new toast notification!
    //         this.addToast("Connection Success.",'');
    //     }
    // },
    async fetchPosts() {
        this.isLoading = true;
        try {
            // const response = await fetch(`https://this-is-fake-123.com/posts`);
            const response = await fetch(`${this.apiUrl}/posts?_limit=5`);
            if (!response.ok) throw new Error();
            this.posts = await response.json();
            this.toasts = []; 
            this.addToast("Success!", "success"); 
        } catch (error) {
            // IMPORTANT: Ensure the 3rd argument is the function
            this.addToast("Failed to sync.", "error", () => this.fetchPosts());
        } finally {
            this.isLoading = false;
        }
    },    
    user: {
        name: 'Taher',
        isLoggedIn: true
    },
    // Centralized Asset Management in Store
    assets: {
        logo: './vit.svg',
        banner: 'https://picsum.photos/id/10/800/400'
    },
    // Actions (Functions to change state)
    toggleTheme() {        
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        console.log('Theme changed to:', this.theme);
    },
    // Helper to clear data (useful for Logout buttons)
    async resetSettings() {
        if (confirm("Are you sure you want to reset all theme settings?")) {
            console.log('Theme Object:', this.theme); // See what methods are available    
            // Check if the function exists before calling it
            if (this.theme && typeof this.theme.purge === 'function') {
                this.theme.purge();
            } else {
                console.warn("Purge function missing! Clearing localStorage manually...");
                localStorage.removeItem('app-theme'); // Fallback: manual clear
            }            
            location.reload();
        }
    }
})