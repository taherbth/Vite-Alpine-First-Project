// src/components/customerCreate.js

export default function customerCreate() {
    return {
        // Form fields
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        status: 'active',
        notes: '',

        // UI state
        submitting: false,
        submitted: false,
        errors: {},

        // Validate
        validate() {
            this.errors = {};

            if (!this.name.trim())
                this.errors.name = 'Customer name is required.';

            if (!this.email.trim()) {
                this.errors.email = 'Email is required.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
                this.errors.email = 'Enter a valid email address.';
            }

            if (!this.phone.trim())
                this.errors.phone = 'Phone number is required.';

            if (!this.city.trim())
                this.errors.city = 'City is required.';

            return Object.keys(this.errors).length === 0;
        },

        // Submit
        async submitCustomer() {
            if (!this.validate()) return;

            this.submitting = true;

            // Simulate API — replace with real endpoint
            await new Promise(resolve => setTimeout(resolve, 800));

            const payload = {
                name:    this.name,
                email:   this.email,
                phone:   this.phone,
                address: this.address,
                city:    this.city,
                status:  this.status,
                notes:   this.notes,
            };

            console.log('Customer created:', payload);

            this.submitting = false;
            this.submitted = true;

            if (window.Alpine?.store('app')?.addToast) {
                Alpine.store('app').addToast('Customer created successfully!', 'success');
            }
        },

        // Reset
        resetForm() {
            this.name = '';
            this.email = '';
            this.phone = '';
            this.address = '';
            this.city = '';
            this.status = 'active';
            this.notes = '';
            this.errors = {};
            this.submitted = false;
        },
    }
}
