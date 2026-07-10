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

            // Component Init Wrapper
            async init() {
                // Pull primary page payload
                await this.fetchCustomers();
            },

            // API Query Core Engine
            async fetchCustomers() {
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

                try {
                    // Accessing v1 framework instance from appStore global reference
                    const response = await Alpine.store('app').apiGet(`customers?${queryParams.toString()}`);
                    
                    // Expecting response configuration structured via Laravel Resources / Pagination
                    // Adjust property extractions depending on exact Laravel API meta layouts
                    const payload = response.data; 

                    this.paginated = payload.data || [];
                    
                    // Parse standard server-side Laravel pagination metadata
                    this.currentPage = payload.current_page || 1;
                    this.totalPages = payload.last_page || 1;
                    this.totalRecords = payload.total || 0;
                    this.fromRecord = payload.from || 0;
                    this.toRecord = payload.to || 0;

                    // Build explicit array range numbers for UI map lists
                    this.generatePageRange();
                    
                    // Clear state selection pointers on batch table updates
                    this.selectedIds = [];
                } catch (error) {
                    console.error("Failed executing customer listing acquisition:", error);
                }
            },

            // Event-driven Mutation Callbacks
            async onFilterChange() {
                this.currentPage = 1; // Reset to start index on modification filters
                await this.fetchCustomers();
            },

            async goToPage(page) {
                // Prevent navigating past max pages or below 1
                if (page < 1 || page > this.totalPages) return;
                
                this.currentPage = page; // Set state
                await this.fetchCustomers(); // Trigger API query string reload
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

            // CRUD Action Execution Wrappers
            async deleteOne(id) {
                if (confirm("Are you sure you want to remove this customer record?")) {
                    try {
                        const response = await fetch(`${Alpine.store('app').apiUrl}/customers/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${Alpine.store('app').token}` }
                        });
                        if (response.ok) {
                            Alpine.store('app').addToast("Customer record deleted successfully.", "success");
                            await this.fetchCustomers();
                        }
                    } catch (e) {
                        Alpine.store('app').addToast("Failed executing remote drop transaction.", "error");
                    }
                }
            }
        }
    //     }));
    // });
}