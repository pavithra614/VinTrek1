import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import isCurrentUserServiceProvider from '@salesforce/apex/UserProfileService.isCurrentUserServiceProvider';

export default class ServiceProviderHomePage extends LightningElement {
    @track activeTab = 'dashboard';
    @track isLoading = true;
    @track error;
    @track hasAccess = false;
    
    // Wire the Apex method to check if user is a service provider
    @wire(isCurrentUserServiceProvider)
    wiredUserAccess({ error, data }) {
        this.isLoading = true;
        if (data !== undefined) {
            this.hasAccess = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.hasAccess = false;
            console.error('Error checking user access:', error);
        }
        this.isLoading = false;
    }
    
    // Handle tab change
    handleTabChange(event) {
        this.activeTab = event.target.value;
    }
    
    // Show toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
