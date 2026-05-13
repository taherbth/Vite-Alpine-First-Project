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
            <a href="javascript:void(0)" x-on:click.stop.prevent="toggle('customers')">
                <span class="title">Customers</span>
                <span class="arrow" :class="{ 'open': openMenu === 'customers' }"></span>
            </a>
            <span class="icon-thumbnail"><i class="fa fa-users"></i></span>
            
            <ul class="sub-menu" 
                x-show="openMenu === 'customers'" 
                x-cloak                
                x-collapse>
                <li>
                    <a href="/frontend/customer">
                        <span class="title">All Customers</span>
                    </a>
                </li>
            </ul>
        </li>

        // Sales Link
        <li :class="{ 'open': openMenu === 'sales' }">
            <a href="javascript:void(0)" x-on:click.stop.prevent="toggle('sales')">
                <span class="title">Sales</span>
                <span class="arrow" :class="{ 'open': openMenu === 'sales' }"></span>
            </a>
            <span class="icon-thumbnail"><i class="fa fa-shopping-cart"></i></span>
            <ul class="sub-menu" x-show="openMenu === 'sales'" x-cloak x-collapse>
                <li>
                    <a href="/frontend/sale/create">
                        <span class="title">Create Sale</span>
                    </a>
                </li>
                <li>
                    <a href="/frontend/sale">
                        <span class="title">History</span>
                    </a>
                </li>
            </ul>
        </li>
    </ul>
`;