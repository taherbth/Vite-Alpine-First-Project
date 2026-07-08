// src/components/customerCreate.js

export default function customerCreate() {
    return {
        // Form fields grouped inside customer_data to match customer-create.html template
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
        submitting: false,
        submitted: false,
        errors: {},

        // Alpine automatic initialization hook
        init() {
            this.loadCommonResources();
        },

        // Fetch dynamic dropdowns from the Laravel API endpoint
        async loadCommonResources() {
            try {
                let result = await Alpine.store('app').apiGet('common-resources');
                // let result = await response.json();
                
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

        // Form Validation
        validate() {
            this.errors = {};

            if (!this.customer_data.customer_no.trim())
                this.errors.customer_no = 'Customer no is required.';

            if (!this.customer_data.first_name.trim())
                this.errors.first_name = 'First name is required.';

            if (!this.customer_data.last_name.trim())
                this.errors.last_name = 'Last name is required.';

            if (!this.customer_data.gender_id)
                this.errors.gender_id = 'Gender is required.';

            if (!this.customer_data.email.trim()) {
                this.errors.email = 'Email is required.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.customer_data.email)) {
                this.errors.email = 'Enter a valid email address.';
            }

            if (!this.customer_data.address.trim())
                this.errors.address = 'Address is required.';

            if (!this.customer_data.city.trim())
                this.errors.city = 'City is required.';

            if (!this.customer_data.country_id)
                this.errors.country_id = 'Country is required.';

            return Object.keys(this.errors).length === 0;
        },

        // Submit form data to your store API[cite: 2]
        async submitCustomer() {
            if (!this.validate()) return;

            this.submitting = true;

            try {
                // Adjust endpoint route matching your application setup
                let result = await Alpine.store('app').apiPost('customer/save_customer', this.customer_data);
                console.log("result: " + JSON.stringify(result))
                // let response = await fetch('/api/customer/save_customer', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'Accept': 'application/json',
                //         // Include CSRF or Bearer Tokens if applicable:
                //         // 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                //     },
                //     body: JSON.stringify(this.customer_data)
                // });

                // let result = await response.json();

                if (result.status==201) {
                    this.submitted = true;
                    if (window.Alpine?.store('app')?.addToast) {
                        Alpine.store('app').addToast(result.data.message, 'success');
                    }
                } else if (result.status === 422) {
                    // Extract validation errors returned directly from Laravel backend
                    this.errors = result.errors;
                } else {
                    alert(result.data.message || 'Something went wrong on submission.');
                }
            } catch (error) {
                console.error('Submission error:', error);
            } finally {
                this.submitting = false;
            }
        },

        // Reset all states back to default values[cite: 2]
        resetForm() {
            this.customer_data = {
                customer_no: '', first_name: '', last_name: '', gender_id: '',
                cell_phone: '', work_phone: '', email: '', date_of_birth: '',
                address: '', address2: '', city: '', zip: '', country_id: '',
                status: 'active', notes: ''
            };
            this.errors = {};
            this.submitted = false;
        },
    }
}