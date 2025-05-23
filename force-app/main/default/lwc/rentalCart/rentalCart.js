import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCampingItemById from '@salesforce/apex/RentalCartController.getCampingItemById';

export default class RentalCart extends LightningElement {
    @track cartItems = [];
    @track isLoading = false;
    @track error;
    @track totalAmount = 0;
    @track rentalDays = 1;
    
    // Handle adding item to cart
    handleAddToCart(event) {
        const itemId = event.detail.itemId;
        this.isLoading = true;
        
        // Call Apex to get the item details
        getCampingItemById({ itemId: itemId })
            .then(result => {
                // Check if item is already in cart
                const existingItemIndex = this.cartItems.findIndex(item => item.Id === result.Id);
                
                if (existingItemIndex !== -1) {
                    // Item already in cart, increment quantity
                    this.cartItems[existingItemIndex].quantity += 1;
                    this.showToast('Success', `Increased quantity of ${result.Name}`, 'success');
                } else {
                    // Add new item to cart
                    this.cartItems.push({
                        ...result,
                        quantity: 1,
                        subtotal: result.Daily_Rate__c * this.rentalDays
                    });
                    this.showToast('Success', `${result.Name} added to cart`, 'success');
                }
                
                this.calculateTotal();
                this.isLoading = false;
            })
            .catch(error => {
                this.error = error;
                this.showToast('Error', 'Error adding item to cart: ' + error.body.message, 'error');
                this.isLoading = false;
            });
    }
    
    // Handle removing item from cart
    handleRemoveFromCart(event) {
        const itemId = event.currentTarget.dataset.id;
        const itemIndex = this.cartItems.findIndex(item => item.Id === itemId);
        
        if (itemIndex !== -1) {
            const itemName = this.cartItems[itemIndex].Name;
            this.cartItems.splice(itemIndex, 1);
            this.calculateTotal();
            this.showToast('Success', `${itemName} removed from cart`, 'success');
        }
    }
    
    // Handle quantity change
    handleQuantityChange(event) {
        const itemId = event.currentTarget.dataset.id;
        const newQuantity = parseInt(event.target.value, 10);
        
        if (newQuantity < 1) {
            return;
        }
        
        const itemIndex = this.cartItems.findIndex(item => item.Id === itemId);
        
        if (itemIndex !== -1) {
            this.cartItems[itemIndex].quantity = newQuantity;
            this.cartItems[itemIndex].subtotal = this.cartItems[itemIndex].Daily_Rate__c * newQuantity * this.rentalDays;
            this.calculateTotal();
        }
    }
    
    // Handle rental days change
    handleDaysChange(event) {
        const days = parseInt(event.target.value, 10);
        
        if (days < 1) {
            return;
        }
        
        this.rentalDays = days;
        
        // Update subtotals for all items
        this.cartItems.forEach(item => {
            item.subtotal = item.Daily_Rate__c * item.quantity * this.rentalDays;
        });
        
        this.calculateTotal();
    }
    
    // Calculate total amount
    calculateTotal() {
        this.totalAmount = this.cartItems.reduce((total, item) => {
            return total + item.subtotal;
        }, 0);
    }
    
    // Handle checkout
    handleCheckout() {
        // This would typically navigate to a checkout page or create a rental record
        // For now, just show a toast message
        this.showToast('Success', 'Checkout functionality coming soon!', 'success');
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
