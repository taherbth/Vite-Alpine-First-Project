// src/components/mediaGallery.js
export default function mediaGallery() {
    return {
        activeAlbum: null,
        showCreateModal: false,
        gallery_data: {
            title: '',
            description: '',
            coverFile: null,
            coverPreviewUrl: null,
            extraFiles: [],
            galleryPreviews: []
        },
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
            // await this.fetchGallery();
            const routeId = this.getGalleryIdFromUrl();
            if (routeId) {
                await this.loadGalleryData(routeId);
            } else {
                await this.fetchGallery();
            }

            // 2. Listen for route change events triggered by Pinecone Router
            // window.addEventListener('fetch-gallery', async (e) => {
            //     if (e.detail?.id) {
            //         await this.loadGalleryData(e.detail.id);
            //     }
            // });
        },
        getGalleryIdFromUrl() {
            const match = window.location.pathname.match(/\/galleries\/(\d+)/);
            return match ? match[1] : null;
        },
        // --- Computed Getters for View & Lightbox ---
        get filteredAlbumMedia() {
            if (!this.activeAlbum || !this.activeAlbum.media) return [];

            if (this.mediaTypeFilter === 'image') {
                return this.activeAlbum.media.filter(item => !item.mime_type || item.mime_type.startsWith('image'));
            }
            if (this.mediaTypeFilter === 'video') {
                return this.activeAlbum.media.filter(item => item.mime_type && item.mime_type.startsWith('video'));
            }
            return this.activeAlbum.media;
        },

        get currentMediaItem() {
            return this.filteredAlbumMedia[this.currentIndex] || null;
        },

        // --- Lightbox Methods ---
        openLightbox(index) {
            alert('dqwdqdw'+index)
            this.currentIndex = index;
            this.lightboxOpen = true;
        },

        closeLightbox() {
            this.lightboxOpen = false;
        },

        nextMedia() {
            if (this.currentIndex < this.filteredAlbumMedia.length - 1) {
                this.currentIndex++;
            } else {
                this.currentIndex = 0; // Loop back to start
            }
        },

        prevMedia() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
            } else {
                this.currentIndex = this.filteredAlbumMedia.length - 1; // Loop to end
            }
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
        async loadGalleryData(id) { 
            try {
                const response = await Alpine.store('app').apiGet(`galleries/${id}`);
                
                // Set active album from API response
                const albumData = response.data?.data || response.data || response;
                this.activeAlbum = albumData;
                
                // Sync with Alpine Store
                if (Alpine.store('app').gallery) {
                    Alpine.store('app').gallery.activeAlbum = albumData;
                }
            } catch (error) {
                console.error("Error loading gallery details:", error);
                this.activeAlbum = null;
            }
        },

        async loadGalleryData__(id) {
            try {
                // Fetch single gallery with media from Laravel API
                const response = await fetch(`/api/galleries/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // adjust auth token if used
                    }
                });

                if (!response.ok) throw new Error('Failed to load gallery');

                const res = await response.json();
                this.activeAlbum = res.data || res;
            } catch (error) {
                console.error('Error loading gallery:', error);
            }
        },

        openAlbumView(album) {
            // Stores selected album into app state for detail/media view
            Alpine.store('app').gallery.activeAlbum = album;
            if (window.PineconeRouter) {
                window.PineconeRouter.navigate(`/galleries/${album.id}`);
            }
        },

        handleCoverSelect(e) {
            const file = e.target.files[0];
            if (file) {
                if (this.gallery_data.coverPreviewUrl) URL.revokeObjectURL(this.gallery_data.coverPreviewUrl);
                this.gallery_data.coverFile = file;
                this.gallery_data.coverPreviewUrl = URL.createObjectURL(file);
            }
        },

        handleGalleryMediaSelect(e) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                this.gallery_data.extraFiles.push(file);
                this.gallery_data.galleryPreviews.push({
                    url: URL.createObjectURL(file),
                    type: file.type.startsWith('video/') ? 'video' : 'image'
                });
            });
            e.target.value = '';
        },

        removeGalleryMedia(index) {
            if (this.gallery_data.galleryPreviews[index]?.url) {
                URL.revokeObjectURL(this.gallery_data.galleryPreviews[index].url);
            }
            this.gallery_data.galleryPreviews.splice(index, 1);
            this.gallery_data.extraFiles.splice(index, 1);
        },

        async submitMediaGallery() {
            if (!this.validate()) return;
            this.submitting = true;
            try {
                const result = await Alpine.store('app').createGalleryWithCover({
                    title: this.gallery_data.title,
                    description: this.gallery_data.description,
                    coverPhoto: this.gallery_data.coverFile,
                    files: this.gallery_data.extraFiles
                });

                if (result.status === 201 || result.status === 200) {
                    this.showCreateModal = false;
                    this.resetForm();
                    Alpine.store('app').addToast("Gallery created successfully!", 'success');
                    await this.fetchGallery();
                } else if (result.status === 422) {
                    this.errors = result.data.errors;
                }
            } catch (error) {
                console.error("Submission error:", error);
            } finally {
                this.submitting = false;
            }
        },

        async deleteAlbum(id) {
            if (!confirm("Are you sure you want to delete this album?")) return;
            try {
                await Alpine.store('app').apiDelete(`galleries/${id}`);
                Alpine.store('app').addToast("Album deleted", "success");
                await this.fetchGallery();
            } catch (error) {
                Alpine.store('app').addToast("Failed to delete album", "error");
            }
        },

        resetForm() {
            if (this.gallery_data.coverPreviewUrl) URL.revokeObjectURL(this.gallery_data.coverPreviewUrl);
            this.gallery_data.galleryPreviews.forEach(item => URL.revokeObjectURL(item.url));
            this.gallery_data = {
                title: '',
                description: '',
                coverFile: null,
                coverPreviewUrl: null,
                extraFiles: [],
                galleryPreviews: []
            };
            this.errors = {};
        },

        validate() {
            this.errors = {};
            if (!this.gallery_data.title.trim()) this.errors.title = 'Title is required.';
            if (!this.gallery_data.coverFile) this.errors.coverFile = 'Cover photo is required.';
            return Object.keys(this.errors).length === 0;
        }
    };
}