import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAllTrailsForAdmin from '@salesforce/apex/TrailController.getAllTrailsForAdmin';

export default class VinTrekAdminHome extends NavigationMixin(LightningElement) {
    @track isLoading = true;
    @track hasAccess = true; // In a real app, this would be determined by user permissions
    @track activeTab = 'dashboard';
    @track trailCount = 0;
    @track campsiteCount = 0;
    @track bookingCount = 0;
    @track error;

    // Wire the Apex method to get all trails
    @wire(getAllTrailsForAdmin)
    wiredTrails({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.trailCount = data.length;
            // In a real app, you would get these counts from Apex
            this.campsiteCount = 12;
            this.bookingCount = 25;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.showToast('Error', 'Error loading data: ' + error.body.message, 'error');
        }
        this.isLoading = false;
    }

    handleTabChange(event) {
        this.activeTab = event.target.value;
    }

    refreshData() {
        this.isLoading = true;
        // Refresh the data
        // In a real app, you would call Apex methods to refresh the data
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'Data refreshed successfully', 'success');
        }, 1000);
    }

    navigateToTrailAdmin() {
        this.activeTab = 'trails';
    }

    navigateToTrailRouteCreator() {
        // Navigate to the trail route creator component
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__trailRouteCreator'
            }
        });
    }

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
