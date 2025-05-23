import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCampingItems from '@salesforce/apex/CampingItemController.getCampingItems';

export default class CampingItemList extends LightningElement {
    @track campingItems = [];
    @track filteredItems = [];
    @track isLoading = true;
    @track searchTerm = '';
    @track error;
    
    // Wire the Apex method to get camping items
    @wire(getCampingItems)
    wiredCampingItems({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.campingItems = data.map(item => ({
                ...item,
                imageUrl: item.Image_URL__c ? item.Image_URL__c : '/resource/camping_default_image',
                selected: false
            }));
            this.filteredItems = [...this.campingItems];
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.campingItems = [];
            this.filteredItems = [];
            this.showToast('Error', 'Error loading camping items: ' + error.body.message, 'error');
        }
        this.isLoading = false;
    }
    
    // Handle search input
    handleSearchChange(event) {
        this.searchTerm = event.target.value.toLowerCase();
        this.filterItems();
    }
    
    // Filter items based on search term
    filterItems() {
        if (this.searchTerm) {
            this.filteredItems = this.campingItems.filter(item => 
                item.Name.toLowerCase().includes(this.searchTerm) || 
                (item.Description__c && item.Description__c.toLowerCase().includes(this.searchTerm))
            );
        } else {
            this.filteredItems = [...this.campingItems];
        }
    }
    
    // Handle item selection
    handleItemSelect(event) {
        const itemId = event.currentTarget.dataset.id;
        const selectedItem = this.campingItems.find(item => item.Id === itemId);
        
        if (selectedItem) {
            // Create a custom event to add item to cart
            const addToCartEvent = new CustomEvent('addtocart', {
                detail: { itemId: itemId }
            });
            this.dispatchEvent(addToCartEvent);
            
            this.showToast('Success', `${selectedItem.Name} added to cart`, 'success');
        }
    }
    
    // Show toast message
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
