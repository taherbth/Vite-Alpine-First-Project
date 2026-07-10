// src/store.js
export default (Alpine) => ({
    // We use Alpine.$persist() to wrap the initial value.
    // Alpine will now automatically sync 'theme' with localStorage['_x_theme'] 
    theme: Alpine.$persist('light').as('app-theme'),
    // isLoggedIn: Alpine.$persist(false),
    isLoggedIn: Alpine.$persist(false).as('app-logged-in'), 
    token: Alpine.$persist(null).as('app-token'), // Store JWT/Sanctum token
    user: Alpine.$persist({ name: 'Guest' }).as('app-user'),

    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    toasts: [],
    isLoading: false,

    posts: [],
    isLoading: false,
    modal: {
        isOpen: false,
        title: '',
        content: ''
    },
    // This runs automatically when Alpine.store('app', ...) is called
    async init() {
        Alpine.effect(async () => {
            const currentTheme = this.theme;
            if (this.isLoggedIn) {
                console.log("Syncing theme to database...", currentTheme);
                // Example API call:
                // await fetch('/api/user/settings', { method: 'POST', body: JSON.stringify({ theme: currentTheme }) });
            }
        });
        // await this.fetchPosts();
        // Listen for route changes
        window.addEventListener('route-changed', () => {
            this.toasts = this.toasts.filter(t => t.type !== 'error');
            console.log('Navigated to:', window.location.pathname);
        });
    },
    async apiGet(endpoint) {
        this.isLoading = true; // Use global loader indicator
        try {
            const response = await fetch(`${this.apiUrl}/${endpoint}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    // Natively attaches your global auth token if logged in[cite: 3]
                    'Authorization': this.token ? `Bearer ${this.token}` : '' 
                }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch resource.');
            return result;
        } catch (error) {
            this.addToast(error.message, "error"); 
            throw error;
        } finally {
            this.isLoading = false; 
        }
    }, 
    async apiPost(endpoint, data) {
        this.isLoading = true;
        try {
            const response = await fetch(`${this.apiUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': this.token ? `Bearer ${this.token}` : '' 
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // if (response.ok) {
            return { status: response.status, data: result }; // Return both!             
            // }else{
            //     const errorMsg = result.message || Object.values(result.errors || {}).flat().join(' ') || 'Authentication failed';
            //     throw new Error(errorMsg);
            // }
            
        } catch (error) {
            this.addToast(error.message, "error");
            throw error;
        } finally {
            this.isLoading = false;
        }
    },
    async handleLogin(credentials) {
        try {
                const { status, data } = await this.apiPost('login', credentials); // Destructure status too![cite: 5]
                
                // 1. Check if the backend rejected the login credentials
                if (status === 401) {
                    this.addToast(data.message || "Invalid email or password.", "error");
                    return; // Stop execution here
                }
                
                // 2. Check for other non-success codes if needed
                if (status >= 400) {
                    this.addToast(data.message || "An unexpected error occurred.", "error");
                    return;
                }

                // 3. Success path
                this.token = data.token; // Adapt based on your exact Laravel response structure[cite: 5]
                this.user = data.user || { name: credentials.email };
                this.isLoggedIn = true;
                this.addToast("Welcome back!", "success");
                window.PineconeRouter.navigate('/dashboard');
                
        } catch (e) {
            // Fallback for network failures/cors errors managed by apiPost[cite: 5]
            console.error("Login network exception:", e);
        }
    },
    async handleRegister(formFields) {
        try {
            const { data } = await this.apiPost('register', formFields);
            this.token = data.token;
            this.user = data.user || { name: formFields.name };
            this.isLoggedIn = true;
            this.addToast("Account created successfully!", "success");
            window.PineconeRouter.navigate('/dashboard');
        } catch (e) {
            // Error managed by apiPost
        }
    },    
    logout() {
        this.isLoggedIn = false;
        this.token = null;
        this.user = { name: 'Guest' };
        this.addToast("Logged out successfully.", "success");
        window.PineconeRouter.navigate('/');
    },

    // login() {
    //     this.isLoggedIn = true;
    //     this.user.name = 'John Doe';
    //     this.addToast("Signed in!", "success");
    // },
    
    // logout() {
    //     this.isLoggedIn = false;
    //     this.user.name = 'Guest';
    //     window.PineconeRouter.navigate('/'); // Redirect to home
    // },
    apiUrl: import.meta.env.VITE_API_URL,

    // addToast(message, type = 'error') {
    //     const id = Date.now();
    //     this.toasts.push({ id, message, type });

    //     // Auto-remove after 4 seconds
    //     setTimeout(() => {
    //         this.toasts = this.toasts.filter(t => t.id !== id);
    //     }, 4000);
    // },   

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
        // if (type === 'success') {
            setTimeout(() => this.removeToast(id), 5000);
        // }success
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
            if (this.posts.length > 0) return; // Don't refetch if we already have them
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
    },
    openModal(title, content) {
        this.modal.title = title;
        this.modal.content = content;
        this.modal.isOpen = true;
        // Lock scroll so page doesn't move behind modal
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        this.modal.isOpen = false;
        document.body.style.overflow = 'auto';
    }
})