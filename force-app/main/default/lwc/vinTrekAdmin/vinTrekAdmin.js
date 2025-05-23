import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getCampsites from '@salesforce/apex/CampsiteController.getCampsites';
import getTrails from '@salesforce/apex/TrailController.getTrails';

export default class VinTrekAdmin extends LightningElement {
    @track isLoading = true;
    @track hasAccess = true; // Set to true for now, can be updated with permission check
    @track activeTab = 'trails';
    
    // Campsite Management
    @track campsites = [];
    @track showNewCampsiteForm = false;
    @track campsiteLatitude = 0;
    @track campsiteLongitude = 0;
    @track campsiteColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Trail', fieldName: 'TrailName', type: 'text' },
        { label: 'Daily Fee', fieldName: 'Daily_Fee__c', type: 'currency' },
        { label: 'Capacity', fieldName: 'Capacity__c', type: 'number' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];
    
    // Trail Management
    @track trails = [];
    @track trailColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Distance (km)', fieldName: 'Distance_km__c', type: 'number' },
        { label: 'Elevation (m)', fieldName: 'Elevation_m__c', type: 'number' },
        { label: 'Difficulty', fieldName: 'Difficulty__c', type: 'text' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];
    
    // Wired methods to fetch data
    wiredCampsitesResult;
    @wire(getCampsites)
    wiredCampsites(result) {
        this.wiredCampsitesResult = result;
        if (result.data) {
            this.campsites = result.data.map(campsite => {
                return {
                    ...campsite,
                    TrailName: campsite.Trail__r ? campsite.Trail__r.Name : ''
                };
            });
            this.isLoading = false;
        } else if (result.error) {
            this.showToast('Error', 'Error loading campsites: ' + result.error.body.message, 'error');
            this.isLoading = false;
        }
    }
    
    wiredTrailsResult;
    @wire(getTrails)
    wiredTrails(result) {
        this.wiredTrailsResult = result;
        if (result.data) {
            this.trails = result.data;
            this.isLoading = false;
        } else if (result.error) {
            this.showToast('Error', 'Error loading trails: ' + result.error.body.message, 'error');
            this.isLoading = false;
        }
    }
    
    // Event handlers
    handleTabChange(event) {
        this.activeTab = event.target.value;
    }
    
    refreshData() {
        this.isLoading = true;
        Promise.all([
            refreshApex(this.wiredCampsitesResult),
            refreshApex(this.wiredTrailsResult)
        ]).then(() => {
            this.isLoading = false;
            this.showToast('Success', 'Data refreshed successfully', 'success');
        }).catch(error => {
            this.isLoading = false;
            this.showToast('Error', 'Error refreshing data: ' + error.body.message, 'error');
        });
    }
    
    // Campsite methods
    handleAddNewCampsite() {
        this.showNewCampsiteForm = true;
    }
    
    handleCancelCampsiteForm() {
        this.showNewCampsiteForm = false;
    }
    
    handleCampsiteFormSuccess() {
        this.showNewCampsiteForm = false;
        this.showToast('Success', 'Campsite created successfully', 'success');
        return refreshApex(this.wiredCampsitesResult);
    }
    
    handleLocationChange(event) {
        this.campsiteLatitude = event.detail.latitude;
        this.campsiteLongitude = event.detail.longitude;
    }
    
    handleCampsiteRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        
        switch (action.name) {
            case 'edit':
                // Handle edit action
                this.showToast('Info', 'Edit functionality will be implemented', 'info');
                break;
            case 'delete':
                // Handle delete action
                this.showToast('Info', 'Delete functionality will be implemented', 'info');
                break;
            default:
                break;
        }
    }
    
    // Trail methods
    handleAddNewTrail() {
        this.showToast('Info', 'Add new trail functionality will be implemented', 'info');
    }
    
    handleTrailRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        
        switch (action.name) {
            case 'edit':
                // Handle edit action
                this.showToast('Info', 'Edit functionality will be implemented', 'info');
                break;
            case 'delete':
                // Handle delete action
                this.showToast('Info', 'Delete functionality will be implemented', 'info');
                break;
            default:
                break;
        }
    }
    
    // Shop methods
    handleAddNewShop() {
        this.showToast('Info', 'Add new shop functionality will be implemented', 'info');
    }
    
    // Camping Item methods
    handleAddNewItem() {
        this.showToast('Info', 'Add new camping item functionality will be implemented', 'info');
    }
    
    // User methods
    handleAddNewUser() {
        this.showToast('Info', 'Add new user functionality will be implemented', 'info');
    }
    
    // Utility methods
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
