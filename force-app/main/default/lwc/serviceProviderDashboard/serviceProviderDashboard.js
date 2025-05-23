import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ServiceProviderDashboard extends LightningElement {
    @track activeTab = 'dashboard';
    
    // Tab visibility properties
    get isDashboardActive() {
        return this.activeTab === 'dashboard';
    }
    
    get isInventoryActive() {
        return this.activeTab === 'inventory';
    }
    
    get isCampsitesActive() {
        return this.activeTab === 'campsites';
    }
    
    get isBookingsActive() {
        return this.activeTab === 'bookings';
    }
    
    get isReportsActive() {
        return this.activeTab === 'reports';
    }
    
    // Tab CSS classes
    get dashboardTabClass() {
        return this.getTabClass('dashboard');
    }
    
    get inventoryTabClass() {
        return this.getTabClass('inventory');
    }
    
    get campsitesTabClass() {
        return this.getTabClass('campsites');
    }
    
    get bookingsTabClass() {
        return this.getTabClass('bookings');
    }
    
    get reportsTabClass() {
        return this.getTabClass('reports');
    }
    
    getTabClass(tabName) {
        return this.activeTab === tabName 
            ? 'slds-tabs_default__content slds-show' 
            : 'slds-tabs_default__content slds-hide';
    }
    
    // Event handlers
    handleTabClick(event) {
        this.activeTab = event.currentTarget.dataset.tabValue;
    }
    
    refreshData() {
        // Refresh data in child components
        const inventoryManager = this.template.querySelector('c-inventory-manager');
        const campsiteManager = this.template.querySelector('c-campsite-manager');
        
        if (inventoryManager) {
            inventoryManager.refreshData();
        }
        
        if (campsiteManager) {
            campsiteManager.refreshData();
        }
        
        this.showToast('Success', 'Dashboard refreshed successfully', 'success');
    }
    
    // Helper methods
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}
