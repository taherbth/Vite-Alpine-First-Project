// src/components/mediaGallery.js

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
            Alpine.store('app').gallery.activeAlbum = album;
            if (window.PineconeRouter) {
                window.PineconeRouter.navigate(`/galleries/${album.id}`);
            }
        },

        // Computed getter — reads reactively from activeAlbum.media
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
        async deleteMediaItem__(galleryId, mediaId) {
            // Correct fallback to activeAlbum ID
            const gId = galleryId || this.activeAlbum?.id;

            if (!gId || !mediaId) {
                console.error("Missing gallery ID or media ID", { galleryId: gId, mediaId });
                if (typeof this.addToast === 'function') {
                    this.addToast("Unable to delete item: Missing parameters", "error");
                }
                return;
            }

            try {
                const endpoint = `galleries/${gId}/media/${mediaId}`;                
                
                // 1. Send DELETE request
                await Alpine.store('app').deleteMedia(endpoint, gId, mediaId);

                // 2. Mutate the core state array (activeAlbum.media) using a fresh array reference
                if (this.activeAlbum && Array.isArray(this.activeAlbum.media)) {
                    this.activeAlbum.media = [
                        ...this.activeAlbum.media.filter(item => String(item.id) !== String(mediaId))
                    ];
                }

                // 3. Sync Lightbox state if lightbox is open
                if (this.lightboxOpen) {
                    const remainingLength = this.filteredAlbumMedia.length;
                    if (remainingLength === 0) {
                        this.closeLightbox();
                    } else if (this.currentIndex >= remainingLength) {
                        this.currentIndex = remainingLength - 1;
                    }
                }

                if (typeof this.addToast === 'function') {
                    this.addToast("Item deleted successfully", "success");
                }
            } catch (error) {
                console.error("Delete media catch triggered by:", error.name, error.message, error);
                if (typeof this.addToast === 'function') {
                    this.addToast(error.message || "Failed to delete item", "error");
                }
            }
        },
        async deleteMediaItem(galleryId, mediaId) {
            const gId = galleryId || this.activeAlbum?.id;

            if (!gId || !mediaId) {
                console.error("Missing gallery ID or media ID", { galleryId: gId, mediaId });
                return;
            }

            if (!confirm("Are you sure you want to delete this media file?")) return;

            try {
                const endpoint = `galleries/${gId}/media/${mediaId}`;
                
                // 1. Call Store API with endpoint, galleryId, and mediaId
                await Alpine.store('app').deleteMedia(endpoint, gId, mediaId);

                // 2. Remove media item from active activeAlbum state
                if (this.activeAlbum && Array.isArray(this.activeAlbum.media)) {
                    this.activeAlbum.media = [
                        ...this.activeAlbum.media.filter(m => String(m.id) !== String(mediaId))
                    ];
                }

                // 3. Sync Lightbox position
                if (this.lightboxOpen) {
                    const remaining = this.filteredAlbumMedia.length;
                    if (remaining === 0) {
                        this.closeLightbox();
                    } else if (this.currentIndex >= remaining) {
                        this.currentIndex = remaining - 1;
                    }
                }

                // Trigger Toast (via global event dispatch or store)
                this.triggerToast("Item deleted successfully", "success");
            } catch (error) {
                console.error("Delete media error:", error);
                this.triggerToast(error.message || "Failed to delete item", "error");
            }
        },
        // Helper function to handle toast dispatch safely
        triggerToast(message, type = 'info') {
            if (typeof this.addToast === 'function') {
                this.addToast(message, type);
            } else if (Alpine.store('app')?.addToast) {
                Alpine.store('app').addToast(message, type);
            } else {
                // Dispatch global browser/Alpine event
                window.dispatchEvent(new CustomEvent('toast', {
                    detail: { message, type }
                }));
            }
        }
    };
}

// Register with Alpine when initialized
document.addEventListener('alpine:init', () => {
    Alpine.data('mediaGallery', mediaGalleryComponent);
});

window.mediaGallery = mediaGalleryComponent;
export default mediaGalleryComponent;