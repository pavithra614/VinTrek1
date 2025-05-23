import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import isCurrentUserAdmin from '@salesforce/apex/UserProfileService.isCurrentUserAdmin';

export default class AdminHomePage extends LightningElement {
    @track activeTab = 'trails';
    @track isLoading = true;
    @track error;
    @track hasAccess = false;

    // Wire the Apex method to check if user is an admin
    @wire(isCurrentUserAdmin)
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
