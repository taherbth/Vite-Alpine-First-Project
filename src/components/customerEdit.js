// src/components/customerEdit.js

export default function customerEdit() {
    return {
        customerId: null,
        // Form fields grouped inside customer_data to match customer-edit.html template
        customer_data: {
            customer_no: '',
            first_name: '',
            last_name: '',
            gender_id: '',
            cell_phone: '',
            work_phone: '',
            email: '',
            date_of_birth: '',
            address: '',
            address2: '',
            city: '',
            zip: '',
            country_id: '',
            status: 'active',
            notes: ''
        },

        // Dropdown data arrays injected from the Laravel API
        gender_lists: [],
        country_lists: [],

        // UI state
        loading: true,
        submitting: false,
        submitted: false,
        errors: {},

        // Alpine automatic initialization hook
        async init() {
            // Extract ID from URL path (e.g. /customers/12/edit or /customers/edit/12)
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            this.customerId = pathSegments.find(segment => !isNaN(segment));

            await this.loadCommonResources();
            if (this.customerId) {
                await this.loadCustomerData();
            } else {
                console.error("Customer ID not found in URL path.");
                this.loading = false;
            }
        },

        // Fetch dynamic dropdowns from the Laravel API endpoint
        async loadCommonResources() {
            try {
                let result = await Alpine.store('app').apiGet('common-resources');
                if (result && result.data) {
                    this.gender_lists = result.data.gender_lists;
                    this.country_lists = result.data.country_lists;
                } else {
                    console.error("Payload data is missing standard structural keys:", result);
                }
            } catch (error) {
                console.error("Error fetching form dropdowns:", error);
            }
        },

        // Fetch existing customer details from Laravel API
        async loadCustomerData() {
            this.loading = true;
            try {
                let result = await Alpine.store('app').apiGet(`customers/${this.customerId}`);
                
                if (result && (result.data || result.status === 200)) {
                    const data = result.data.data || result.data;
                    
                    // Hydrate customer_data
                    this.customer_data = {
                        customer_no: data.customer_no || '',
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        gender_id: data.gender_id || '',
                        cell_phone: data.cell_phone || '',
                        work_phone: data.work_phone || '',
                        email: data.email || '',
                        date_of_birth: data.date_of_birth || '',
                        address: data.address || '',
                        address2: data.address2 || '',
                        city: data.city || '',
                        zip: data.zip || '',
                        country_id: data.country_id || '',
                        status: data.status || 'active',
                        notes: data.notes || ''
                    };
                } else {
                    alert("Failed to load customer data.");
                }
            } catch (error) {
                console.error("Error fetching customer details:", error);
            } finally {
                this.loading = false;
            }
        },

        // Form Validation
        validate() {
            this.errors = {};

            if (!this.customer_data.customer_no?.toString().trim())
                this.errors.customer_no = 'Customer no is required.';

            if (!this.customer_data.first_name?.trim())
                this.errors.first_name = 'First name is required.';

            if (!this.customer_data.last_name?.trim())
                this.errors.last_name = 'Last name is required.';

            if (!this.customer_data.gender_id)
                this.errors.gender_id = 'Gender is required.';

            if (this.customer_data.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.customer_data.email)) {
                this.errors.email = 'Enter a valid email address.';
            }

            if (!this.customer_data.address?.trim())
                this.errors.address = 'Address is required.';

            if (!this.customer_data.city?.trim())
                this.errors.city = 'City is required.';

            if (!this.customer_data.country_id)
                this.errors.country_id = 'Country is required.';

            return Object.keys(this.errors).length === 0;
        },

        // Submit form data to update API
        async updateCustomer() {
            if (!this.validate()) return;
            this.submitting = true;
            this.errors = {}; // Reset errors before submitting

            try {
                let result = await Alpine.store('app').apiPut(`/customers/${this.customerId}`, this.customer_data);

                if (result.status === 200 || result.status === 201) {
                    this.submitted = true;
                    if (window.Alpine?.store('app')?.addToast) {
                        Alpine.store('app').addToast(result.data.message || 'Customer updated successfully!', 'success');
                        window.PineconeRouter.navigate('/customers');
                    }
                } else if (result.status === 422) {
                    // Extract validation errors returned directly from Laravel backend
                    this.errors = result.data.errors;
                } else {
                    alert(result.data.message || 'Something went wrong on update.');
                }
            } catch (error) {
                console.error("Network or unexpected error:", error.message);
            } finally {
                this.submitting = false;
            }
        },

        // Reset fields back to fetched values
        resetForm() {
            this.loadCustomerData();
            this.errors = {};
            this.submitted = false;
        }
    }
}