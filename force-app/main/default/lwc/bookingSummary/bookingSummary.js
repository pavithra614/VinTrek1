import { LightningElement, api, track } from 'lwc';

export default class BookingSummary extends LightningElement {
    @api campsite;
    @api trail;
    @api campingItems = [];
    @api cartItems = [];
    @api booking;
    @api numberOfDays = 0;
    @api totalPrice = 0;

    get formattedTotalPrice() {
        return this.totalPrice ? `$${this.totalPrice.toFixed(2)}` : '$0.00';
    }

    get formattedCampsitePrice() {
        if (this.campsite && this.campsite.Price_Per_Night__c && this.numberOfDays) {
            return `$${(this.campsite.Price_Per_Night__c * this.numberOfDays).toFixed(2)}`;
        }
        return '$0.00';
    }

    get cartItemsTotal() {
        if (!this.cartItems || this.cartItems.length === 0) return 0;
        return this.cartItems.reduce((total, item) => {
            return total + (item.Price_Per_Day__c * item.quantity * this.numberOfDays);
        }, 0);
    }

    get formattedCartItemsTotal() {
        return `$${this.cartItemsTotal.toFixed(2)}`;
    }

    get showTrailDetails() {
        return this.trail != null;
    }

    get showCampsiteDetails() {
        return this.campsite != null;
    }

    get showCampingItemsDetails() {
        return this.campingItems && this.campingItems.length > 0;
    }

    get showCartItems() {
        return this.cartItems && this.cartItems.length > 0;
    }

    get campsitePricePerNight() {
        return this.campsite && this.campsite.Price_Per_Night__c ? 
               `$${this.campsite.Price_Per_Night__c.toFixed(2)}` : '$0.00';
    }

    get campsiteCapacity() {
        return this.campsite && this.campsite.Capacity__c ? this.campsite.Capacity__c : 'N/A';
    }

    get facilitiesText() {
        return this.campsite && this.campsite.Facilities__c ? this.campsite.Facilities__c : 'Standard';
    }
}
