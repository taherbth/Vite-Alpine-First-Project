// src/store.js
export default () => ({
    // We use Alpine.$persist() to wrap the initial value.
    // Alpine will now automatically sync 'theme' with localStorage['_x_theme'] 
    theme: Alpine.$persist('light').as('app-theme'),
    posts: [],
    isLoading: false,
    toasts: [], // Array to hold active notifications
    apiUrl: import.meta.env.VITE_API_URL,

    addToast(message, type = 'error') {
        const id = Date.now();
        this.toasts.push({ id, message, type });

        // Auto-remove after 4 seconds
        setTimeout(() => {
            this.toasts = this.toasts.filter(t => t.id !== id);
        }, 4000);
    },

    // This runs automatically when Alpine.store('app', ...) is called
    async init() {
        await this.fetchPosts();
    },    
    async fetchPosts() {
        this.isLoading = true;
        // Create a timer promise (e.g., 800ms)
        const timer = new Promise(resolve => setTimeout(resolve, 800));
        try {
            const fetchPromise = await fetch(`${this.apiUrl}/posts?_limit=5`);
            // MAGIC PART: We wait for BOTH to finish
            // This ensures the spinner stays for at least 800ms
            const [response] = await Promise.all([fetchPromise, timer]);

            if (!response.ok) throw new Error('Network response was not ok');
            this.posts = await response.json();
        } catch (error) {
            // Use our new toast notification!
            this.addToast("Connection failed. Please try again later.");
        } finally {
            this.isLoading = false;
            // Use our new toast notification!
            this.addToast("Connection Success.",'success');
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