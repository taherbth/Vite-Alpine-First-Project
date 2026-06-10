// src/components/nav.js
import { menuTemplate } from './sidebar-nav.js';

export default function navLogic() {
    return {
        openMenu: null,
        isPinned: false,

        init() {
            const sidebarMenu = document.querySelector('.sidebar-menu');
            if (sidebarMenu) {
                sidebarMenu.innerHTML = menuTemplate;
            }
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
    }
}