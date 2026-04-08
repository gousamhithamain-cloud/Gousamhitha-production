/**
 * Admin Vendors Handler
 * Uses backend API instead of direct Supabase
 */

console.log('🏢 Loading Admin Vendors Handler...');

let editingVendorId = null;

// ══════════════════════════════════════════════════════════════════════════════
// LOAD VENDORS
// ══════════════════════════════════════════════════════════════════════════════

async function loadVendors() {
    console.log('🏢 Loading vendors...');
    
    const tbody = document.getElementById('vendors-table-body');
    
    if (!tbody) {
        console.error('❌ Vendors table body not found');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading vendors...</td></tr>';
    
    try {
        const vendors = await AdminVendorsAPI.getAll({ limit: 100 });
        
        console.log('✅ RAW VENDORS RESPONSE:', vendors);
        console.log('✅ Vendors type:', typeof vendors);
        console.log('✅ Is array?', Array.isArray(vendors));
        
        // Debug: Log first vendor to see field names
        if (vendors && vendors.length > 0) {
            console.log('🔍 First vendor structure:', vendors[0]);
            console.log('🔍 Available fields:', Object.keys(vendors[0]));
            console.log('🔍 vendor_name value:', vendors[0].vendor_name);
            console.log('🔍 business_name value:', vendors[0].business_name);
        }
        
        if (!vendors || vendors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #666;">No vendors found. Add your first vendor using the form above.</td></tr>';
            return;
        }
        
        displayVendors(vendors);
        
    } catch (error) {
        console.error('❌ Error loading vendors:', error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading vendors: ${error.message}</td></tr>`;
    }
}

function displayVendors(vendors) {
    const tbody = document.getElementById('vendors-table-body');
    
    // Safety check: ensure vendors is an array
    if (!Array.isArray(vendors)) {
        console.error('❌ Vendors is not an array:', vendors);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #d32f2f;">Error: Invalid data format</td></tr>';
        return;
    }
    
    if (!vendors || vendors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #666;">No vendors available</td></tr>';
        return;
    }
    
    // Debug first vendor
    console.log('🔍 FIRST VENDOR IN DISPLAY:', vendors[0]);
    console.log('🔍 VENDOR FIELDS:', Object.keys(vendors[0]));
    
    tbody.innerHTML = vendors.map(vendor => `
        <tr>
            <td>${vendor.vendor_name || 'N/A'}</td>
            <td>${vendor.business_name || 'N/A'}</td>
            <td>${vendor.phone || 'N/A'}</td>
            <td>${vendor.address || 'N/A'}</td>
            <td>
                <span class="status-badge ${vendor.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${vendor.status || 'active'}
                </span>
            </td>
            <td>
                <button class="btn-edit" onclick="editVendor('${vendor.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteVendor('${vendor.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// ADD VENDOR
// ══════════════════════════════════════════════════════════════════════════════

async function handleVendorSubmit(event) {
    event.preventDefault();
    
    console.log('💾 Saving vendor...');
    
    const messageEl = document.getElementById('vendor-message');
    
    const vendorData = {
        vendor_name: document.getElementById('vendor-name').value,
        business_name: document.getElementById('business-name').value,
        phone: document.getElementById('vendor-phone').value || null,
        address: document.getElementById('vendor-address').value || null,
        status: document.getElementById('vendor-status').value || 'active'
    };
    
    console.log('📤 Vendor data:', vendorData);
    
    try {
        if (editingVendorId) {
            // Update existing vendor
            await AdminVendorsAPI.update(editingVendorId, vendorData);
            console.log('✅ Vendor updated successfully');
            messageEl.textContent = 'Vendor updated successfully!';
            messageEl.className = 'form-message success';
            editingVendorId = null;
        } else {
            // Create new vendor
            await AdminVendorsAPI.create(vendorData);
            console.log('✅ Vendor created successfully');
            messageEl.textContent = 'Vendor added successfully!';
            messageEl.className = 'form-message success';
        }
        
        // Reset form
        document.getElementById('vendor-form').reset();
        
        // Reload vendors
        await loadVendors();
        
        // Clear message after 3 seconds
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'form-message';
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error saving vendor:', error);
        messageEl.textContent = 'Error: ' + error.message;
        messageEl.className = 'form-message error';
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT VENDOR
// ══════════════════════════════════════════════════════════════════════════════

async function editVendor(id) {
    console.log('✏️ Editing vendor:', id);
    
    try {
        const vendor = await AdminVendorsAPI.getById(id);
        
        console.log('✅ Vendor loaded for editing:', vendor);
        
        // Set form values
        editingVendorId = id;
        document.getElementById('vendor-name').value = vendor.vendor_name || '';
        document.getElementById('business-name').value = vendor.business_name || '';
        document.getElementById('vendor-phone').value = vendor.phone || '';
        document.getElementById('vendor-address').value = vendor.address || '';
        document.getElementById('vendor-status').value = vendor.status || 'active';
        
        // Scroll to form
        document.getElementById('vendor-form').scrollIntoView({ behavior: 'smooth' });
        
        // Update form title
        const formTitle = document.querySelector('.vendor-form-section h2');
        if (formTitle) {
            formTitle.textContent = 'Edit Vendor';
        }
        
    } catch (error) {
        console.error('❌ Error loading vendor:', error);
        alert('Error loading vendor: ' + error.message);
    }
}

function cancelEdit() {
    editingVendorId = null;
    document.getElementById('vendor-form').reset();
    
    const formTitle = document.querySelector('.vendor-form-section h2');
    if (formTitle) {
        formTitle.textContent = 'Add New Vendor';
    }
    
    const messageEl = document.getElementById('vendor-message');
    messageEl.textContent = '';
    messageEl.className = 'form-message';
}

// ══════════════════════════════════════════════════════════════════════════════
// DELETE VENDOR
// ══════════════════════════════════════════════════════════════════════════════

async function deleteVendor(id) {
    if (!confirm('Are you sure you want to delete this vendor?')) {
        return;
    }
    
    console.log('🗑️ Deleting vendor:', id);
    
    try {
        await AdminVendorsAPI.delete(id);
        
        console.log('✅ Vendor deleted successfully');
        alert('Vendor deleted successfully!');
        
        await loadVendors();
        
    } catch (error) {
        console.error('❌ Error deleting vendor:', error);
        alert('Error deleting vendor: ' + error.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════════════════════════════════════

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

window.loadVendors = loadVendors;
window.handleVendorSubmit = handleVendorSubmit;
window.editVendor = editVendor;
window.cancelEdit = cancelEdit;
window.deleteVendor = deleteVendor;
window.adminLogout = adminLogout;

// ══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════════

function initializeVendorsPage() {
    console.log('🚀 Initializing vendors page...');
    
    // Load vendors (auth check removed for initial load)
    loadVendors();
    
    // Setup form handler
    const form = document.getElementById('vendor-form');
    if (form) {
        form.addEventListener('submit', handleVendorSubmit);
    }
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVendorsPage);
} else {
    initializeVendorsPage();
}

console.log('✅ Admin Vendors Handler loaded');
