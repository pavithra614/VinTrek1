import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createBooking from '@salesforce/apex/BookingController.createBooking';

export default class BookingForm extends LightningElement {
    @api trailId;
    @api campsiteId;
    
    @track startDate;
    @track endDate;
    @track numberOfPeople = 1;
    @track isLoading = false;
    
    handleStartDateChange(event) {
        this.startDate = event.target.value;
    }
    
    handleEndDateChange(event) {
        this.endDate = event.target.value;
    }
    
    handleNumberOfPeopleChange(event) {
        this.numberOfPeople = event.target.value;
    }
    
    handleSubmit() {
        // Validate form
        if (!this.startDate || !this.endDate) {
            this.showToast('Error', 'Please select both start and end dates', 'error');
            return;
        }
        
        if (new Date(this.startDate) > new Date(this.endDate)) {
            this.showToast('Error', 'End date must be after start date', 'error');
            return;
        }
        
        if (!this.trailId && !this.campsiteId) {
            this.showToast('Error', 'Please select a trail or campsite', 'error');
            return;
        }
        
        // Create booking
        this.isLoading = true;
        
        const bookingData = {
            trailId: this.trailId,
            campsiteId: this.campsiteId,
            startDate: this.startDate,
            endDate: this.endDate,
            numberOfPeople: this.numberOfPeople
        };
        
        createBooking({ bookingData: bookingData })
            .then(result => {
                this.isLoading = false;
                this.showToast('Success', 'Booking created successfully', 'success');
                this.dispatchEvent(new CustomEvent('bookingcreated', {
                    detail: { bookingId: result }
                }));
                this.resetForm();
            })
            .catch(error => {
                this.isLoading = false;
                this.showToast('Error', 'Error creating booking: ' + error.body.message, 'error');
            });
    }
    
    resetForm() {
        this.startDate = null;
        this.endDate = null;
        this.numberOfPeople = 1;
    }
    
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
