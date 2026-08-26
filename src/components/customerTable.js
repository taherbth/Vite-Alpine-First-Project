export default function customerTable() {
    // document.addEventListener('alpine:init', () => {
    //     Alpine.data('customerTable', () => ({
            // State Properties driven by UI models

        return {
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

           
            onSearchInput() {
                clearTimeout(this._searchTimeout);
                this._searchTimeout = setTimeout(() => {
                    this.onFilterChange();
                }, 400);
            },
            // Component Init Wrapper
            async init() {
                // Pull primary page payload
                await this.$nextTick();
                await this.fetchCustomers();
            },

            // API Query Core Engine
            async fetchCustomers(cursor = null) {
                console.trace("fetchCustomers called! Current Page is:", this.currentPage);
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
                    const response = await Alpine.store('app').apiGet(`customers?${queryParams.toString()}`);
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
            // Safeguarded mutation callback
            async onFilterChange() {  
                this.currentPage = 1; 
                await this.fetchCustomers();
            },

            async goToPage__normal_and_cursor_paginate(cursor = null,page) {

                // Prevent navigating past max pages or below 1
                if (page < 1 || page > this.totalPages) return;
                
                this.currentPage = page; // Set state
                await this.fetchCustomers(cursor); // Trigger API query string reload
            },
            // Handler for Scout MiliSearch Pagination
            goToPage(page) {
               if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
                    this.currentPage = page; // Set state first
                    this.fetchCustomers();    // Fetch updated page
                }
            },

            async setSort(field) {
                if (this.sortField === field) {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortField = field;
                    this.sortOrder = 'asc';
                }
                await this.fetchCustomers();
            },

            // Range Generator Helper
            generatePageRange() {
                let pages = [];
                for (let i = 1; i <= this.totalPages; i++) {
                    pages.push(i);
                }
                this.pageNumbers = pages;
            },

            // UI Utility Formatter Matchers
            sortIcon(field) {
                if (this.sortField !== field) return 'fa-sort text-muted';
                return this.sortOrder === 'asc' ? 'fa-sort-amount-asc text-primary' : 'fa-sort-amount-desc text-primary';
            },

            formatDate(dateString) {
                if (!dateString) return 'N/A';
                return new Date(dateString).toLocaleDateString();
            },

            // Select and Multi-batch toggles[cite: 6]
            get allChecked() {
                return this.paginated.length > 0 && this.paginated.every(c => this.selectedIds.includes(c.id));
            },

            toggleAll() {
                if (this.allChecked) {
                    this.selectedIds = [];
                } else {
                    this.selectedIds = this.paginated.map(c => c.id);
                }
            },

            toggleOne(id) {
                if (this.selectedIds.includes(id)) {
                    this.selectedIds = this.selectedIds.filter(item => item !== id);
                } else {
                    this.selectedIds.push(id);
                }
            },          
            async deleteItems(id = null, targetUrl = '', redirectUrl = '') {
                
                // Fallback to selectedIds if no single ID is passed
                const item_ids = id ? [id] : this.selectedIds;

                if (item_ids.length === 0) {
                    alert('Please select at least one item to delete.');
                    return;
                }

                const message = item_ids.length === 1 
                    ? 'Are you sure you want to delete this customer?' 
                    : `Are you sure you want to delete ${item_ids.length} selected customers?`;

                if (!confirm(message)) {
                    return;
                }
                try {
                        // Adjust endpoint route matching your application setup
                        let result = await Alpine.store('app').apiPost(targetUrl, { item_ids: item_ids });
                        console.log("result: " + JSON.stringify(result))                

                        if (result.status==201 || result.status==200) {
                            this.submitted = true;
                            if (window.Alpine?.store('app')?.addToast) {
                                Alpine.store('app').addToast(result.data.message, 'success');
                                await this.fetchCustomers();
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

                // try {
                //     const response = await fetch(`${Alpine.store('app').apiUrl}`+targetUrl, {
                //         method: 'POST',
                //         headers: { 'Authorization': `Bearer ${Alpine.store('app').token}` },
                //         'Content-Type': 'application/json', // <-- CRITICAL
                //         body: JSON.stringify({ item_ids: item_ids })
                //     });                    
                // } catch (error) {
                //     console.error('Delete request failed:', error);
                //     alert('A network error occurred.');
                // }
            },
            editCustomer(id) {
                // Client-side routing via Pinecone Router
                if (window.PineconeRouter) {
                    window.PineconeRouter.navigate(`/customers/${id}/edit`);
                } else {
                    // Fallback for standard page redirection
                    window.location.href = `/customers/${id}/edit`;
                }
            }
        }
    //     }));
    // });
}