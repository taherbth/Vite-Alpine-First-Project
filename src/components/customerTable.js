// src/components/customerTable.js

export default function customerTable() {
    return {
        // ── Raw data ──────────────────────────────────────────────
        allCustomers: [
            { id: 1,  name: 'Rahim Uddin',    email: 'rahim@example.com',   phone: '01711-111111', address: 'Dhaka, Bangladesh',     totalSales: 12, createdDate: '2024-01-15', status: 'active' },
            { id: 2,  name: 'Karim Hossain',  email: 'karim@example.com',   phone: '01822-222222', address: 'Chittagong, Bangladesh', totalSales: 7,  createdDate: '2024-02-20', status: 'active' },
            { id: 3,  name: 'Fatema Begum',   email: 'fatema@example.com',  phone: '01933-333333', address: 'Sylhet, Bangladesh',     totalSales: 3,  createdDate: '2024-03-10', status: 'inactive' },
            { id: 4,  name: 'Jamal Ahmed',    email: 'jamal@example.com',   phone: '01644-444444', address: 'Rajshahi, Bangladesh',   totalSales: 19, createdDate: '2024-03-25', status: 'active' },
            { id: 5,  name: 'Nasrin Akter',   email: 'nasrin@example.com',  phone: '01755-555555', address: 'Khulna, Bangladesh',     totalSales: 5,  createdDate: '2024-04-05', status: 'active' },
            { id: 6,  name: 'Selim Mia',      email: 'selim@example.com',   phone: '01866-666666', address: 'Barisal, Bangladesh',    totalSales: 0,  createdDate: '2024-04-18', status: 'inactive' },
            { id: 7,  name: 'Ruma Khatun',    email: 'ruma@example.com',    phone: '01977-777777', address: 'Mymensingh, Bangladesh', totalSales: 8,  createdDate: '2024-05-01', status: 'active' },
            { id: 8,  name: 'Babul Islam',    email: 'babul@example.com',   phone: '01588-888888', address: 'Comilla, Bangladesh',    totalSales: 14, createdDate: '2024-05-14', status: 'active' },
            { id: 9,  name: 'Mitu Sarker',    email: 'mitu@example.com',    phone: '01699-999999', address: 'Narayanganj, Bangladesh',totalSales: 2,  createdDate: '2024-06-02', status: 'inactive' },
            { id: 10, name: 'Hasan Ali',      email: 'hasan@example.com',   phone: '01700-100100', address: 'Gazipur, Bangladesh',    totalSales: 22, createdDate: '2024-06-20', status: 'active' },
            { id: 11, name: 'Shirin Parvin',  email: 'shirin@example.com',  phone: '01811-200200', address: 'Tangail, Bangladesh',    totalSales: 6,  createdDate: '2024-07-08', status: 'active' },
            { id: 12, name: 'Dulal Chandra',  email: 'dulal@example.com',   phone: '01922-300300', address: 'Jessore, Bangladesh',    totalSales: 9,  createdDate: '2024-07-22', status: 'active' },
        ],

        // ── Filter / Search state ─────────────────────────────────
        search: '',
        statusFilter: 'all',
        sortKey: 'name',
        sortDir: 'asc',

        // ── Pagination state ──────────────────────────────────────
        currentPage: 1,
        perPage: 5,

        // ── Selection state ───────────────────────────────────────
        selectedIds: [],

        // ── Filtered + sorted + paginated ─────────────────────────
        get filtered() {
            let data = this.allCustomers;

            // Search
            const q = this.search.toLowerCase();
            if (q) {
                data = data.filter(c =>
                    c.name.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    c.phone.includes(q) ||
                    c.address.toLowerCase().includes(q)
                );
            }

            // Status filter
            if (this.statusFilter !== 'all') {
                data = data.filter(c => c.status === this.statusFilter);
            }

            // Sort
            data = [...data].sort((a, b) => {
                let valA = a[this.sortKey];
                let valB = b[this.sortKey];
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
                return 0;
            });

            return data;
        },

        get totalPages() {
            return Math.ceil(this.filtered.length / this.perPage) || 1;
        },

        get paginated() {
            const start = (this.currentPage - 1) * this.perPage;
            return this.filtered.slice(start, start + this.perPage);
        },

        get pageNumbers() {
            const pages = [];
            for (let i = 1; i <= this.totalPages; i++) pages.push(i);
            return pages;
        },

        get fromRecord() {
            return this.filtered.length === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1;
        },

        get toRecord() {
            return Math.min(this.currentPage * this.perPage, this.filtered.length);
        },

        // ── Sort ──────────────────────────────────────────────────
        setSort(key) {
            if (this.sortKey === key) {
                this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortKey = key;
                this.sortDir = 'asc';
            }
            this.currentPage = 1;
        },

        sortIcon(key) {
            if (this.sortKey !== key) return 'fa-sort';
            return this.sortDir === 'asc' ? 'fa-sort-asc' : 'fa-sort-desc';
        },

        // ── Pagination ────────────────────────────────────────────
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },

        // Reset page when filters change
        onFilterChange() {
            this.currentPage = 1;
            this.selectedIds = [];
        },

        // ── Selection ─────────────────────────────────────────────
        get allChecked() {
            return this.paginated.length > 0 &&
                this.paginated.every(c => this.selectedIds.includes(c.id));
        },

        toggleAll() {
            if (this.allChecked) {
                this.selectedIds = this.selectedIds.filter(
                    id => !this.paginated.map(c => c.id).includes(id)
                );
            } else {
                this.paginated.forEach(c => {
                    if (!this.selectedIds.includes(c.id)) this.selectedIds.push(c.id);
                });
            }
        },

        toggleOne(id) {
            const idx = this.selectedIds.indexOf(id);
            if (idx === -1) this.selectedIds.push(id);
            else this.selectedIds.splice(idx, 1);
        },

        // ── Actions ───────────────────────────────────────────────
        deleteOne(id) {
            if (!confirm('Delete this customer?')) return;
            this.allCustomers = this.allCustomers.filter(c => c.id !== id);
            this.selectedIds = this.selectedIds.filter(i => i !== id);
            // Replace with: await fetch(`/api/customer/${id}`, { method: 'DELETE' })
        },

        deleteSelected() {
            if (!this.selectedIds.length) return;
            if (!confirm(`Delete ${this.selectedIds.length} selected customer(s)?`)) return;
            this.allCustomers = this.allCustomers.filter(c => !this.selectedIds.includes(c.id));
            this.selectedIds = [];
            // Replace with: await fetch('/api/customer/remove', { method: 'POST', body: JSON.stringify({ ids: this.selectedIds }) })
        },

        // ── Helpers ───────────────────────────────────────────────
        formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        },
    }
}
