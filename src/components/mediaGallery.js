// src/components/mediaGallery.js
export default function mediaGallery() {

    return {

        gallery_data: {
            title: '',
            coverFile: '',
            coverPreviewUrl: null,
            extraFiles: [],        // Raw File objects for submission
            galleryPreviews: []
        },   // Array of { url, type } objects
        search: '',
        statusFilter: 'all',
        perPage: 10,
        currentPage: 1,

        // Server Response Payload Vectors
        paginated: [],      // Dynamic rows bound to table templates
        totalRecords: 0,    // Total records available matching parameters
        fromRecord: 0,      // Index range tracking bounds
        toRecord: 0,
        totalPages: 1,
        pageNumbers: [],

        // Operational lists
        selectedIds: [],
        sortField: 'createdDate',
        sortOrder: 'desc',
        async init() {
            // Fetch gallery items on initialization
            // this.$store.app.fetchGallery(true);

            // // Keyboard listeners for the Lightbox
            // window.addEventListener('keydown', (e) => {
            //     if (!this.$store.app.gallery.lightboxOpen) return;
            //     if (e.key === 'Escape') this.$store.app.closeLightbox();
            //     if (e.key === 'ArrowRight') this.$store.app.nextMedia();
            //     if (e.key === 'ArrowLeft') this.$store.app.prevMedia();
            // });
                    // Pull primary page payload
            await this.$nextTick();
            await this.fetchGallery();
                
        },

        // API Query Core Engine
        async fetchGallery__(reset = false) {
            if (reset) {
                this.gallery.page = 1;
                this.gallery.items = [];
                this.gallery.hasMore = true;
            }

            if (this.isLoading || this.gallery.isLoadingMore || !this.gallery.hasMore) return;

            if (this.gallery.page === 1) {
                this.isLoading = true;
            } else {
                this.gallery.isLoadingMore = true;
            }

            try {
                // Sends query params: ?page=1&per_page=12&category=all&search=...
                const queryParams = new URLSearchParams({
                    page: this.gallery.page,
                    per_page: this.gallery.perPage,
                    category: this.gallery.selectedCategory,
                    search: this.gallery.searchQuery
                }).toString();

                const response = await this.apiGet(`galleries?${queryParams}`);
                
                // Expected backend pagination structure (Laravel style or custom standard)
                const newItems = response.data || response.items || response;
                const meta = response.meta || response;

                this.gallery.items = [...this.gallery.items, ...newItems];
                this.gallery.lastPage = meta.last_page || 1;
                this.gallery.hasMore = this.gallery.page < this.gallery.lastPage;

                // Update dynamic categories
                const cats = new Set(this.gallery.items.map(item => item.category).filter(Boolean));
                this.gallery.categories = ['all', ...Array.from(cats)];
            } catch (error) {
                console.error('Failed to load gallery items:', error);
            } finally {
                this.isLoading = false;
                this.gallery.isLoadingMore = false;
            }
        },
        handleGalleryMediaSelect(event) {
            const files = Array.from(event.target.files);
            
            files.forEach(file => {
                // Append file to raw files array for submission
                this.extraFiles.push(file);

                // Generate temporary blob URL for display
                this.galleryPreviews.push({
                    url: URL.createObjectURL(file),
                    type: file.type.startsWith('video/') ? 'video' : 'image'
                });
            });

            // Reset file input value to allow re-selecting identical files if needed
            event.target.value = '';
        },
        async fetchGallery(cursor = null) {
            console.trace("fetchGallery called! Current Page is:", this.currentPage);
            // Generate standard Laravel Pagination Query URL Structure 
            // e.g. /customers?page=1&per_page=10&search=john&status=active&sort_by=name&sort_order=asc
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                per_page: this.perPage,
                search: this.search,
                status: this.statusFilter,
                sort_by: this.sortField,
                sort_order: this.sortOrder
            });  
            // ✅ Dynamically add the cursor if it exists
            if (cursor) {
                queryParams.set('cursor', cursor);
            }               
           
            try {
                // Accessing v1 framework instance from appStore global reference
                const response = await Alpine.store('app').apiGet(`galleries?${queryParams.toString()}`);
                // Expecting response configuration structured via Laravel Resources / Pagination
                // Adjust property extractions depending on exact Laravel API meta layouts
                const payload = response.data; 
                this.paginated = payload.data || [];
                
                // Parse standard server-side Laravel pagination metadata
                this.currentPage = parseInt(payload.current_page || 1);
                this.totalPages = parseInt(payload.last_page || 1);
                this.totalRecords = parseInt(payload.total || 0);
                this.fromRecord = parseInt(payload.from || 0);
                this.toRecord = parseInt(payload.to || 0);

                // For cursorPaginate
                // this.nextCursor  = payload.next_cursor;
                // this.prevCursor  = payload.prev_cursor;
                // this.hasMore     = payload.has_more;


                // Scout MiliSearch pagination
                // this.paginated    = response.data || [];
                // this.currentPage  = parseInt(response.current_page || 1);
                // this.totalPages   = parseInt(response.last_page || 1);
                // this.totalRecords = parseInt(response.total || 0);
                // this.fromRecord   = parseInt(response.from || 0);
                // this.toRecord     = parseInt(response.to || 0);

                // Build explicit array range numbers for UI map lists
                this.generatePageRange();
                
                // Clear state selection pointers on batch table updates
                this.selectedIds = [];
            } catch (error) {
                console.error("Failed executing customer listing acquisition:", error);
            }
        },
        // File Input / Drag & Drop Handlers
        handleFileSelect(e) {
            const files = e.target.files;
            if (files.length) {
                this.$store.app.uploadFiles(files);
                e.target.value = ''; // Reset input
            }
        },
        handleDrop(e) {
            this.$store.app.gallery.isDragging = false;
            const files = e.dataTransfer.files;
            if (files.length) {
                this.$store.app.uploadFiles(files);
            }
        },
        // Infinite Scroll trigger
        handleScroll(e) {
            const el = e.target;
            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 100) {
                this.$store.app.loadNextPage();
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
            if (this.galleryPreviews[index]?.url) {
                URL.revokeObjectURL(this.galleryPreviews[index].url);
            }
            this.galleryPreviews.splice(index, 1);
            this.extraFiles.splice(index, 1);
        },
        async submitMediaGallery() {
            if (!this.validate()) alert('error')
            this.submitting = true;
            this.errors = {}; 
            try{
                const result = await Alpine.store('app').createGalleryWithCover({
                    title: this.gallery_data.title,
                    description: this.gallery_data.description,
                    coverPhoto: this.gallery_data.coverFile,
                    files: this.gallery_data.extraFiles
                });
                if (result.status==201 || result.status==200) {
                    this.submitted = true;
                    this.gallery_data.title = '';
                    this.gallery_data.description = '';
                    this.gallery_data.coverFile = null;
                    if (this.gallery_data.coverPreviewUrl) URL.revokeObjectURL(this.gallery_data.coverPreviewUrl);
                    this.gallery_data.coverPreviewUrl = null;

                    this.gallery_data.galleryPreviews.forEach(item => URL.revokeObjectURL(item.url));
                    this.gallery_data.galleryPreviews = [];
                    this.gallery_data.extraFiles = [];
                    if (window.Alpine?.store('app')?.addToast) {
                        Alpine.store('app').addToast(result.data.message, 'success');
                        //window.PineconeRouter.navigate('/customers');
                    }
                } else if (result.status === 422) {
                    // Extract validation errors returned directly from Laravel backend
                    this.errors = result.data.errors;
                } else {
                    alert(result.data.message || 'Something went wrong on submission.');
                }
            } catch (error) {
               console.error("Network or unexpected error:", error.message);
            } finally {
                this.submitting = false;
            }            
        },
         validate() {
            this.errors = {};
            if (!this.gallery_data.title.trim())
                this.errors.title = 'Title is required.';

            if (!this.gallery_data.coverFile.trim())
                this.errors.coverFile = 'Cover photo is required.';
            return Object.keys(this.errors).length === 0;
        },
    }
};