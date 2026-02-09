export default () => ({
    open: false,
    toggle() {
        this.open = !this.open;
    },
    links: [
        { label: 'Home', url: '/' },
        { label: 'About', url: '/about' },
        { label: 'Contact', url: '/contact' }
    ]
});