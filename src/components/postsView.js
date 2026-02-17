// src/components/postsView.js
export default () => ({
    limit: 6,
    offset: 0,
    canLoadMore: true,

    init() {
        // Automatically fetch when the component is created
        this.loadContent();
        // Setup the Observer to watch a "sentinel" element at the bottom
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && this.canLoadMore && !window.Alpine.store('app').isLoading) {
                this.loadContent();
            }
        }, { threshold: 0.1 });

        // Wait for DOM to be ready, then watch the loader
        setTimeout(() => {
            const target = document.querySelector('#infinite-scroll-trigger');
            if (target) observer.observe(target);
        }, 500);
    },

    async loadContent() {
        const store = window.Alpine.store('app');
        
        // Prevent double-fetching if we already have data
        // if (store.posts.length > 0) return;
        store.isLoading = true;        
        // Add this line to force a 2-second wait for scrolling loading test
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_limit=${this.limit}&_start=${this.offset}`);
            const newPosts = await response.json();

            if (!response.ok) throw new Error('Network response was not ok'); 
            store.addToast("Blog synced successfully", "success"); 

            if (newPosts.length < this.limit) this.canLoadMore = false;
            
            store.posts = [...store.posts, ...newPosts]; // Append new posts
            this.offset += this.limit;
        } catch (error) {
            // IMPORTANT: Ensure the 3rd argument is the function
            store.addToast("Failed to sync.", "error", () => this.loadContent());
        }
        finally {
            store.isLoading = false;
        }
    }
});