// src/components/postsView.js
export default () => ({
    init() {
        // Automatically fetch when the component is created
        this.loadContent();
    },

    async loadContent() {
        const store = window.Alpine.store('app');
        
        // Prevent double-fetching if we already have data
        if (store.posts.length > 0) return;
        store.isLoading = true;
        try {
            // const response = await fetch(`https://this-is-fake-123.com/posts`);
            const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=6');
            if (!response.ok) throw new Error('Network response was not ok');            
            store.posts = await response.json();
            store.addToast("Blog synced successfully", "success");
        } catch (error) {
            // IMPORTANT: Ensure the 3rd argument is the function
            store.addToast("Failed to sync.", "error", () => this.loadContent());
        } finally {
            store.isLoading = false;
        }
    }
});