// src/components/sidebar-template.js

export const menuTemplate = `
    <ul class="menu-items">
        <li :class="{ 'open active': isActive('/dashboard') }">
            <a href="/frontend/dashboard" @click="openMenu = null">
                <span class="title">Dashboard</span>
            </a>
            <span class="icon-thumbnail bg-success"><i class="pg-home"></i></span>
        </li>

        <li :class="{ 'open': openMenu === 'customers' }">
            <a href="javascript:;" @click="toggle('customers')">
                <span class="title">Customers</span>
                <span class="arrow" :class="{ 'open': openMenu === 'customers' }"></span>
            </a>
            <span class="icon-thumbnail"><i class="fa fa-users"></i></span>
            <ul class="sub-menu" x-show="openMenu === 'customers'" x-collapse>
                <li :class="{ 'active': isActive('/frontend/customer') }">
                    <a href="/frontend/customer">All Customers</a>
                </li>
            </ul>
        </li>

        <li :class="{ 'open': openMenu === 'sales' }">
            <a href="javascript:;" @click="toggle('sales')">
                <span class="title">Sales</span>
                <span class="arrow" :class="{ 'open': openMenu === 'sales' }"></span>
            </a>
            <span class="icon-thumbnail"><i class="fa fa-shopping-cart"></i></span>
            <ul class="sub-menu" x-show="openMenu === 'sales'" x-collapse>
                <li><a href="/frontend/sale/create">Create Sale</a></li>
                <li><a href="/frontend/sale">History</a></li>
            </ul>
        </li>
    </ul>
`;