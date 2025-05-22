import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class VinTrekApp extends LightningElement {
    @track selectedTrailId;
    @track selectedCampsiteId;
    @track activeTab = 'trails';
    
    handleTrailSelect(event) {
        this.selectedTrailId = event.detail.trailId;
        this.selectedCampsiteId = null;
    }
    
    handleCampsiteSelect(event) {
        this.selectedCampsiteId = event.detail.campsiteId;
        this.selectedTrailId = null;
    }
    
    handleTabChange(event) {
        this.activeTab = event.target.value;
    }
    
    handleBookingCreated(event) {
        const bookingId = event.detail.bookingId;
        this.showToast('Success', 'Booking created successfully!', 'success');
    }
    
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
    
    get showTrailBooking() {
        return this.selectedTrailId != null;
    }
    
    get showCampsiteBooking() {
        return this.selectedCampsiteId != null;
    }
}
