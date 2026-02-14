export default () => ({
    formData: { email: '', message: '' },
    errors: {},
    
    submitForm() {
        this.errors = {};
        
        // Validation logic
        if (!this.formData.email.includes('@')) {
            this.errors.email = 'Valid email required';
        }
        if (this.formData.message.length < 10) {
            this.errors.message = 'Message too short (min 10 chars)';
        }
        
        // Success logic
        if (Object.keys(this.errors).length === 0) {
            window.Alpine.store('app').addToast('Message sent!', 'success');
            this.formData = { email: '', message: '' };
        }
    }
});