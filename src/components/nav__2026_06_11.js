// ✅ nav.js — must be a function
export default function navigation() {
    return {
        openMenu: null,
        toggle(menu) {
            this.openMenu = this.openMenu === menu ? null : menu
        },
        isActive(path) {
            return window.location.pathname === path
        }
    }
}

// navigation.js
// export default () => ({
//     sidebarVisible: false, // Required for the layout
//     sidebarPinned: false,  // Required for the layout
//     openMenu: null,

//     init() {
//         if (this.isActive('/frontend/customer')) {
//             this.openMenu = 'customers';
//         } else if (this.isActive('/frontend/sale')) {
//             this.openMenu = 'sales';
//         }
//     },

//     isActive(path) {
//         return window.location.pathname.includes(path);
//     },

//     toggle(menu) {
//         this.openMenu = this.openMenu === menu ? null : menu;
//     },
    
//     toggleSidebar() {
//         this.sidebarVisible = !this.sidebarVisible;
//     },

//     togglePin() {
//         this.sidebarPinned = !this.sidebarPinned;
//     }
// })