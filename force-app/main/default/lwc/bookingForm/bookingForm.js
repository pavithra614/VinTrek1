import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createBooking from '@salesforce/apex/BookingController.createBooking';
import getDefaultCampsiteId from '@salesforce/apex/BookingController.getDefaultCampsiteId';

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

        // Debug logging
        console.log('BookingForm - trailId:', this.trailId);
        console.log('BookingForm - campsiteId:', this.campsiteId);
        console.log('BookingForm - campsiteId type:', typeof this.campsiteId);

        // Validate campsite ID if provided
        let validCampsiteId = this.campsiteId;
        if (this.campsiteId) {
            // Check if the ID is a valid campsite ID (should start with 'a01' for Campsite__c)
            if (!this.campsiteId.startsWith('a01')) {
                // If it's not a valid campsite ID, try to use a default campsite
                console.warn('Invalid campsite ID provided:', this.campsiteId);
                console.warn('ID appears to be:', this.campsiteId.startsWith('02i') ? 'Camping Item ID' : 'Unknown object type');
                this.showToast('Warning', 'Invalid campsite selected. Getting default campsite.', 'warning');

                // Get default campsite dynamically
                this.isLoading = true;
                getDefaultCampsiteId()
                    .then(defaultId => {
                        if (defaultId) {
                            validCampsiteId = defaultId;
                            this.proceedWithBooking(validCampsiteId);
                        } else {
                            this.isLoading = false;
                            this.showToast('Error', 'No valid campsite available. Please select a campsite manually.', 'error');
                        }
                    })
                    .catch(error => {
                        this.isLoading = false;
                        this.showToast('Error', 'Error getting default campsite: ' + error.body.message, 'error');
                    });
                return; // Exit early to wait for async call
            }
        }

        // Proceed with booking using the original or validated campsite ID
        this.proceedWithBooking(validCampsiteId);
    }

    proceedWithBooking(campsiteId) {
        // Create booking
        this.isLoading = true;

        const bookingData = {
            trailId: this.trailId,
            campsiteId: campsiteId,
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