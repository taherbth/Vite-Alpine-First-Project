// src/components/sidebar-template.js
export const menuTemplate = `    
    <ul class="menu-items">
        <!-- Dashboard -->
        <li :class="{ 'open active': isActive('/dashboard') }">
            <a href="/dashboard" @click="openMenu = null">
                <span class="title">Dashboard</span>
            </a>
            <span class="icon-thumbnail bg-success"><i class="pg-home"></i></span>
        </li>

        <!-- Customers -->
        <li :class="{ 'open': openMenu === 'customers' }">
            <a href="#" @click.prevent="toggle('customers')">
                <span class="title">Customers</span>
                <span class="arrow" :class="{ open: openMenu === 'customers' }"></span>
            </a>
            <span class="icon-thumbnail"><i class="fa fa-users"></i></span>
            <!-- FIX 5: No x-cloak, no x-bind:class on the ul.
                 CSS rule: li.open > ul.sub-menu { display: block } handles visibility. -->
            <ul class="sub-menu">
                <li :class="{ 'active': isActive('/customer') }">
                    <a href="/customer"><span>All Customers</span></a>
                </li>
            </ul>
        </li>

        <!-- Sales -->
        <li :class="{ 'open': openMenu === 'sales' }">
            <a href="#" @click.prevent="toggle('sales')">
                <span class="title">Sales</span>
                <span class="arrow" :class="{ open: openMenu === 'sales' }"></span>
            </a>
            <span class="icon-thumbnail"><i class="fa fa-shopping-cart"></i></span>
            <ul class="sub-menu">
                <li :class="{ 'active': isActive('/sale/create') }">
                    <a href="/sale/create"><span>Create Sale</span></a>
                </li>
                <li :class="{ 'active': isActive('/sale') }">
                    <a href="/sale"><span>Sale</span></a>
                </li>
            </ul>
        </li>

    </ul>
`;