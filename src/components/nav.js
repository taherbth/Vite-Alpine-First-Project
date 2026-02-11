// src/components/nav.js
export default () => ({
    open: false,
    links: [
        { label: 'Home', url: '/' },
        { label: 'Posts', url: '/posts' },
        { label: 'About', url: '/about' },
        { label: 'Contact', url: '/contact' }
    ],
    toggle() {
        this.open = !this.open;
    }
});