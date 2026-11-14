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

        // Add Media (to existing album) States
        showAddMediaModal: false,
        newMediaItems: [],          // [{ key, file, url, type }]
        uploadingMedia: false,
        uploadProgress: 0,
        isDragging: false,
        addMediaError: '',
        maxUploadSizeMB: 50,
        gallery_data: {
            title: '',
            description: '',
            coverFile: null,
            coverPreviewUrl: null,
            extraFiles: [],
            galleryPreviews: []
        },

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
            // if (!this.validate()) return;
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
        async deleteAlbum(albumId) {
            if (!albumId) {
                console.error("Missing album ID ", { albumId: albumId});
                return;
            }
            if (!confirm("Are you sure you want to delete this album?")) return;

            try {
                const endpoint = `galleries/${albumId}`;                
                // 1. Call Store API with endpoint, galleryId, and mediaId
                await Alpine.store('app').deleteAlbum(endpoint, albumId);

                if (Array.isArray(this.paginated)) {
                    this.paginated = this.paginated.filter(album => String(album.id) !== String(albumId));
                }
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
        // -----------------------------------------------------------------
        // Add Media to Existing Album
        // -----------------------------------------------------------------
        openAddMediaModal() {
            if (!this.activeAlbum?.id) return;
            this.addMediaError = '';
            this.showAddMediaModal = true;
        },

        closeAddMediaModal() {
            if (this.uploadingMedia) return; // don't close mid-upload
            this.clearNewMedia();
            this.showAddMediaModal = false;
        },

        addNewMediaFiles(fileList) {
            this.addMediaError = '';
            const maxBytes = this.maxUploadSizeMB * 1024 * 1024;
            const rejected = [];

            Array.from(fileList || []).forEach(file => {
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');

                if (!isImage && !isVideo) return rejected.push(`${file.name} (unsupported type)`);
                if (file.size > maxBytes) return rejected.push(`${file.name} (over ${this.maxUploadSizeMB} MB)`);

                const key = `${file.name}-${file.size}-${file.lastModified}`;
                if (this.newMediaItems.some(m => m.key === key)) return; // skip duplicates

                this.newMediaItems.push({
                    key,
                    file,
                    url: URL.createObjectURL(file),
                    type: isImage ? 'image' : 'video'
                });
            });

            if (rejected.length) {
                this.addMediaError = `Skipped: ${rejected.join(', ')}`;
            }
        },

        removeNewMedia(index) {
            const [removed] = this.newMediaItems.splice(index, 1);
            if (removed) URL.revokeObjectURL(removed.url);
        },

        clearNewMedia() {
            this.newMediaItems.forEach(m => URL.revokeObjectURL(m.url));
            this.newMediaItems = [];
            this.uploadProgress = 0;
            this.isDragging = false;
        },

        async uploadMediaToAlbum() {
            if (!this.activeAlbum?.id || this.newMediaItems.length === 0) return;

            this.uploadingMedia = true;
            this.uploadProgress = 0;
            this.addMediaError = '';

            try {
                const files = this.newMediaItems.map(m => m.file);
                const result = await Alpine.store('app').uploadMediaToGallery(
                    this.activeAlbum.id,
                    files,
                    (percent) => { this.uploadProgress = percent; }
                );

                if (result.status === 200 || result.status === 201) {
                    if (Array.isArray(result.media)) {
                        // Backend returned the new media items: append them
                        this.activeAlbum.media = [...(this.activeAlbum.media || []), ...result.media];
                    } else {
                        // Unknown response shape: reload the album from the server
                        await this.loadGalleryData(this.activeAlbum.id);
                    }

                    const count = files.length;
                    this.uploadingMedia = false;
                    this.closeAddMediaModal();
                    this.triggerToast(`${count} ${count === 1 ? 'file' : 'files'} added to album`, 'success');
                } else if (result.status === 422) {
                    this.addMediaError =
                        Object.values(result.data?.errors || {}).flat().join(' ') ||
                        result.data?.message ||
                        'Some files were rejected by the server.';
                } else {
                    this.addMediaError = result.data?.message || 'Upload failed. Try again.';
                }
            } catch (error) {
                console.error("Add media error:", error);
                this.addMediaError = error.message || 'Upload failed. Try again.';
            } finally {
                this.uploadingMedia = false;
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