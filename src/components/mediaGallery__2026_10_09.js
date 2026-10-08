// src/components/mediaGallery.js

// 1. Define the component constructor
function mediaGalleryComponent() {
    return {
        activeAlbum: null,
        showCreateModal: false,
        search: '',
        perPage: 12,
        currentPage: 1,
        paginated: [],
        errors: {},
        submitting: false,

        // Lightbox & Filter States
        lightboxOpen: false,
        currentIndex: 0,
        mediaTypeFilter: 'all',

        async init() {
            await this.$nextTick();
            const routeId = this.getGalleryIdFromUrl();
            if (routeId) {
                await this.loadGalleryData(routeId);
            } else {
                await this.fetchGallery();
            }
        },

        getGalleryIdFromUrl() {
            const match = window.location.pathname.match(/\/galleries\/(\d+)/);
            return match ? match[1] : null;
        },

        async fetchGallery() {
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                per_page: this.perPage,
                search: this.search
            });

            try {
                const response = await Alpine.store('app').apiGet(`galleries?${queryParams.toString()}`);
                
                // Normalizes response format (Laravel length-aware paginator vs simple array)
                const items = response.data?.data || response.data || response;
                this.paginated = Array.isArray(items) ? items : [];

                // Sync store items
                Alpine.store('app').gallery.items = this.paginated;
            } catch (error) {
                console.error("Error fetching galleries:", error);
                this.paginated = [];
            }
        },
        openAlbumView(album) {
            // Stores selected album into app state for detail/media view
            Alpine.store('app').gallery.activeAlbum = album;
            if (window.PineconeRouter) {
                window.PineconeRouter.navigate(`/galleries/${album.id}`);
            }
        },

        get filteredAlbumMedia() {
            if (!this.activeAlbum || !Array.isArray(this.activeAlbum.media)) return [];

            if (this.mediaTypeFilter === 'image') {
                return this.activeAlbum.media.filter(item => !item.mime_type || item.mime_type.startsWith('image'));
            }
            if (this.mediaTypeFilter === 'video') {
                return this.activeAlbum.media.filter(item => item.mime_type && item.mime_type.startsWith('video'));
            }
            return this.activeAlbum.media;
        },

        get currentMediaItem() {
            const list = this.filteredAlbumMedia;
            if (this.currentIndex < 0 || this.currentIndex >= list.length) return null;
            return list[this.currentIndex];
        },

        openLightbox(index) {
            console.log('Opening lightbox at index:', index); // Debug line
            const parsedIndex = parseInt(index, 10);
            if (isNaN(parsedIndex)) return;

            this.currentIndex = parsedIndex;
            this.lightboxOpen = true;
        },

        closeLightbox() {
            this.lightboxOpen = false;
        },

        nextMedia() {
            const list = this.filteredAlbumMedia;
            if (list.length === 0) return;
            this.currentIndex = (this.currentIndex + 1) % list.length;
        },

        prevMedia() {
            const list = this.filteredAlbumMedia;
            if (list.length === 0) return;
            this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
        },

        async loadGalleryData(id) { 
            try {
                const response = await Alpine.store('app').apiGet(`galleries/${id}`);
                this.activeAlbum = response.data?.data || response.data || response;
            } catch (error) {
                console.error("Error loading gallery details:", error);
                this.activeAlbum = null;
            }
        },

        async deleteMediaItem__(gallery, medium) {   
            try {
                var endpoint = `galleries/${gallery}/media/${medium}`;
                await Alpine.store('app').deleteMedia(`${endpoint}`);
                if (this.activeAlbum && Array.isArray(this.activeAlbum.media)) {
                    this.activeAlbum.media = this.activeAlbum.media.filter(m => m.id !== mediaId);
                }
            } catch (err) {
                console.error('Delete failed:', err);
            }
        },
        async deleteMediaItem(galleryId, mediaId) {
            // Fallback to activeAlbum ID if item.gallery_id is missing/null
            const gId = galleryId || this.filteredAlbumMedia?.gallery_id;

            if (!gId || !mediaId) {
                console.error("Missing gallery ID or media ID", { galleryId: gId, mediaId });
                this.addToast("Unable to delete item: Missing parameters", "error");
                return;
            }

            try {
                const endpoint = `galleries/${gId}/media/${mediaId}`;                
                // Execute DELETE request via Alpine app store
                await Alpine.store('app').deleteMedia(endpoint);
                // Remove item from reactive array (triggers auto-update in UI)
                // Force reactive array update in Alpine
                this.filteredAlbumMedia = [...this.filteredAlbumMedia.filter(item => String(item.id) !== String(mediaId))];

                // Handle lightbox sync if open
                if (this.lightboxOpen) {
                    if (this.filteredAlbumMedia.length === 0) {
                        this.closeLightbox();
                    } else if (this.currentLightboxIndex >= this.filteredAlbumMedia.length) {
                        this.currentLightboxIndex = this.filteredAlbumMedia.length - 1;
                    }
                }
                this.addToast("Item deleted successfully", "success");
            } catch (error) {
                console.error("Delete media error:", error);
                this.addToast(error.message || "Failed to delete item", "error");
            }
        }
    };
}

// 2. Register with Alpine when initialized
document.addEventListener('alpine:init', () => {
    Alpine.data('mediaGallery', mediaGalleryComponent);
});

// 3. Fallback for non-module dynamic imports
window.mediaGallery = mediaGalleryComponent;
export default mediaGalleryComponent;