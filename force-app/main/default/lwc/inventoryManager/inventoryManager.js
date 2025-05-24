import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

// Apex methods
import getServiceProviderItems from '@salesforce/apex/CampingItemController.getServiceProviderItems';

export default class InventoryManager extends NavigationMixin(LightningElement) {
    @track isLoading = false;
    @track error;
    @track campingItems = [];
    @track showNewItemForm = false;
    
    @track itemColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Category', fieldName: 'Category__c', type: 'text' },
        { label: 'Daily Rate', fieldName: 'Daily_Rate__c', type: 'currency' },
        { label: 'Status', fieldName: 'Status__c', type: 'text' },
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
    wiredCampingItemsResult;

    // Wire the camping items for the service provider
    @wire(getServiceProviderItems)
    wiredCampingItems(result) {
        this.wiredCampingItemsResult = result;
        const { data, error } = result;

        if (data) {
            this.campingItems = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.campingItems = [];
            console.error('Error loading camping items:', error);
        }
    }

    // Public method for refreshing data (called from parent component)
    refreshData() {
        this.isLoading = true;
        return refreshApex(this.wiredCampingItemsResult)
            .then(() => {
                this.showToast('Success', 'Inventory refreshed successfully', 'success');
            })
            .catch(error => {
                console.error('Error refreshing inventory:', error);
                this.showToast('Error', 'Failed to refresh inventory', 'error');
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

    // Camping Item Form Methods
    handleAddNewItem() {
        this.showNewItemForm = true;
    }

    handleCancelItemForm() {
        this.showNewItemForm = false;
    }

    handleItemFormSuccess(event) {
        const itemId = event.detail.id;
        this.showNewItemForm = false;
        this.showToast('Success', 'Camping item created successfully', 'success');

        // Refresh the camping items list
        return refreshApex(this.wiredCampingItemsResult);
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
            case 'edit':
                this.navigateToRecordPage(row.Id, 'Camping_Item__c', 'edit');
                break;
            case 'delete':
                this.deleteItem(row.Id);
                break;
            default:
                break;
        }
    }

    deleteItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            deleteRecord(itemId)
                .then(() => {
                    this.showToast('Success', 'Camping item deleted', 'success');
                    return refreshApex(this.wiredCampingItemsResult);
                })
                .catch(error => {
                    this.showToast('Error', 'Error deleting item: ' + error.body.message, 'error');
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
