import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

// Apex methods
import getServiceProviderCampsites from '@salesforce/apex/CampsiteController.getServiceProviderCampsites';

export default class CampsiteManager extends NavigationMixin(LightningElement) {
    @track isLoading = false;
    @track error;
    @track campsites = [];
    @track showNewCampsiteForm = false;
    @track campsiteLatitude = 7.8731; // Default to Sri Lanka
    @track campsiteLongitude = 80.7718;
    
    @track campsiteColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Trail', fieldName: 'trailName', type: 'text' },
        { label: 'Daily Fee', fieldName: 'Daily_Fee__c', type: 'currency' },
        { label: 'Capacity', fieldName: 'Capacity__c', type: 'number' },
        { label: 'Facilities', fieldName: 'Facilities__c', type: 'text' },
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

    // Store the wired result for refreshing
    wiredCampsitesResult;

    // Wire the campsites for the service provider
    @wire(getServiceProviderCampsites)
    wiredCampsites(result) {
        this.wiredCampsitesResult = result;
        const { data, error } = result;

        if (data) {
            // Process the data to add a trailName field for display in the datatable
            this.campsites = data.map(campsite => {
                return {
                    ...campsite,
                    trailName: campsite.Trail__r ? campsite.Trail__r.Name : 'None'
                };
            });
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.campsites = [];
            console.error('Error loading campsites:', error);
        }
    }

    // Public method for refreshing data (called from parent component)
    refreshData() {
        this.isLoading = true;
        return refreshApex(this.wiredCampsitesResult)
            .then(() => {
                this.showToast('Success', 'Campsites refreshed successfully', 'success');
            })
            .catch(error => {
                console.error('Error refreshing campsites:', error);
                this.showToast('Error', 'Failed to refresh campsites', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
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

    // Campsite Form Methods
    handleAddNewCampsite() {
        // Reset the form values
        this.campsiteLatitude = 7.8731; // Default to Sri Lanka
        this.campsiteLongitude = 80.7718;
        this.showNewCampsiteForm = true;
    }

    handleCancelCampsiteForm() {
        this.showNewCampsiteForm = false;
    }

    handleCampsiteFormSuccess(event) {
        const campsiteId = event.detail.id;
        this.showNewCampsiteForm = false;
        this.showToast('Success', 'Campsite created successfully', 'success');

        // Refresh the campsites list
        return refreshApex(this.wiredCampsitesResult);
    }

    handleLocationChange(event) {
        // Update the latitude and longitude values when the location is changed on the map
        this.campsiteLatitude = event.detail.latitude;
        this.campsiteLongitude = event.detail.longitude;

        // Find and update the hidden input fields
        const latitudeField = this.template.querySelector('lightning-input-field[field-name="Latitude__c"]');
        const longitudeField = this.template.querySelector('lightning-input-field[field-name="Longitude__c"]');

        if (latitudeField) {
            latitudeField.value = this.campsiteLatitude;
        }

        if (longitudeField) {
            longitudeField.value = this.campsiteLongitude;
        }
    }

    handleCampsiteRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
            case 'edit':
                this.navigateToRecordPage(row.Id, 'Campsite__c', 'edit');
                break;
            case 'delete':
                this.deleteCampsite(row.Id);
                break;
            default:
                break;
        }
    }

    deleteCampsite(campsiteId) {
        if (confirm('Are you sure you want to delete this campsite?')) {
            deleteRecord(campsiteId)
                .then(() => {
                    this.showToast('Success', 'Campsite deleted', 'success');
                    return refreshApex(this.wiredCampsitesResult);
                })
                .catch(error => {
                    this.showToast('Error', 'Error deleting campsite: ' + error.body.message, 'error');
                });
        }
    }

    // Navigation helper
    navigateToRecordPage(recordId, objectApiName, actionName) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: objectApiName,
                actionName: actionName
            }
        });
    }
}
