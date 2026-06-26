// src/components/nav.js
import { menuTemplate } from './sidebar-nav.js';

export default function navLogic() {
    return {
        openMenu: null,
        isPinned: false,
        currentView: '',           // 👈 holds the rendered HTML
        sidebarCollapsed: false, // 👈 Track collapsed state

        init() {
            // Inject sidebar
            const sidebarMenu = document.querySelector('.sidebar-menu');
            if (sidebarMenu) sidebarMenu.innerHTML = menuTemplate;
        },

        // Call this from router to swap views
        async loadView(path) {
            const res = await fetch(path);
            this.currentView = await res.text();
            // Re-init Alpine on injected view content
            this.$nextTick(() => {
                Alpine.initTree(document.querySelector('#main'));
            });
        },

        toggle(menu) {
            this.openMenu = this.openMenu === menu ? null : menu;
        },

        isActive(path) {
            return window.location.pathname === path;
        },

        togglePin() {
            this.isPinned = !this.isPinned;
        },
        // 👈 Add toggle helper
        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
        }
    }
}