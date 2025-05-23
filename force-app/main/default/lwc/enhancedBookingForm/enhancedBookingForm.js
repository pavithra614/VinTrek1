import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import isCampsiteAvailable from '@salesforce/apex/AvailabilityController.isCampsiteAvailable';
import isCampingItemAvailable from '@salesforce/apex/AvailabilityController.isCampingItemAvailable';
import createBooking from '@salesforce/apex/BookingController.createBooking';
import getCampsiteDetails from '@salesforce/apex/BookingController.getCampsiteDetails';
import getTrailDetails from '@salesforce/apex/BookingController.getTrailDetails';
import getCampingItemDetails from '@salesforce/apex/BookingController.getCampingItemDetails';
import getUserProfile from '@salesforce/apex/BookingController.getUserProfile';
import userId from '@salesforce/user/Id';

export default class EnhancedBookingForm extends NavigationMixin(LightningElement) {
    @api trailId;
    @api campsiteId;
    @api campingItemIds = [];
    @api showAvailabilityCalendar = true;
    
    @track isLoading = true;
    @track error;
    @track booking = {
        startDate: null,
        endDate: null,
        numberOfPeople: 1,
        specialRequests: '',
        termsAccepted: false
    };
    @track trail;
    @track campsite;
    @track campingItems = [];
    @track userProfile;
    @track totalPrice = 0;
    @track numberOfDays = 0;
    @track showSuccessMessage = false;
    @track bookingId;
    
    connectedCallback() {
        this.loadInitialData();
    }
    
    loadInitialData() {
        this.isLoading = true;
        
        // Set default dates (today and tomorrow)
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        this.booking.startDate = this.formatDateForInput(today);
        this.booking.endDate = this.formatDateForInput(tomorrow);
        
        // Load user profile
        getUserProfile({ userId: userId })
            .then(result => {
                this.userProfile = result;
                
                // Load trail details if trailId is provided
                if (this.trailId) {
                    return getTrailDetails({ trailId: this.trailId });
                }
                return null;
            })
            .then(trailResult => {
                if (trailResult) {
                    this.trail = trailResult;
                }
                
                // Load campsite details if campsiteId is provided
                if (this.campsiteId) {
                    return getCampsiteDetails({ campsiteId: this.campsiteId });
                }
                return null;
            })
            .then(campsiteResult => {
                if (campsiteResult) {
                    this.campsite = campsiteResult;
                    
                    // If trail wasn't loaded directly but campsite has a trail, load it
                    if (!this.trail && this.campsite.Trail__c) {
                        return getTrailDetails({ trailId: this.campsite.Trail__c });
                    }
                }
                return null;
            })
            .then(trailFromCampsiteResult => {
                if (trailFromCampsiteResult) {
                    this.trail = trailFromCampsiteResult;
                }
                
                // Load camping item details if campingItemIds are provided
                if (this.campingItemIds && this.campingItemIds.length > 0) {
                    return getCampingItemDetails({ campingItemIds: this.campingItemIds });
                }
                return [];
            })
            .then(campingItemsResult => {
                if (campingItemsResult && campingItemsResult.length > 0) {
                    this.campingItems = campingItemsResult;
                }
                
                this.calculateTotalPrice();
                this.error = undefined;
            })
            .catch(error => {
                this.error = error.body ? error.body.message : error.message;
                console.error('Error loading booking data', error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    calculateTotalPrice() {
        // Calculate number of days
        if (this.booking.startDate && this.booking.endDate) {
            const start = new Date(this.booking.startDate);
            const end = new Date(this.booking.endDate);
            const diffTime = Math.abs(end - start);
            this.numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } else {
            this.numberOfDays = 0;
        }
        
        // Calculate total price
        let total = 0;
        
        // Add campsite fee
        if (this.campsite && this.campsite.Daily_Fee__c) {
            total += this.campsite.Daily_Fee__c * this.numberOfDays;
        }
        
        // Add camping items fees
        if (this.campingItems && this.campingItems.length > 0) {
            this.campingItems.forEach(item => {
                if (item.Daily_Fee__c) {
                    total += item.Daily_Fee__c * this.numberOfDays;
                }
            });
        }
        
        this.totalPrice = total;
    }
    
    handleStartDateChange(event) {
        this.booking.startDate = event.target.value;
        this.calculateTotalPrice();
    }
    
    handleEndDateChange(event) {
        this.booking.endDate = event.target.value;
        this.calculateTotalPrice();
    }
    
    handleNumberOfPeopleChange(event) {
        this.booking.numberOfPeople = event.target.value;
    }
    
    handleSpecialRequestsChange(event) {
        this.booking.specialRequests = event.target.value;
    }
    
    handleTermsChange(event) {
        this.booking.termsAccepted = event.target.checked;
    }
    
    handleSubmit() {
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Check availability
        this.checkAvailability()
            .then(isAvailable => {
                if (!isAvailable) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'The selected dates are not available. Please choose different dates.',
                            variant: 'error'
                        })
                    );
                    return;
                }
                
                // Create booking
                this.createBooking();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body ? error.body.message : error.message,
                        variant: 'error'
                    })
                );
            });
    }
    
    checkAvailability() {
        // Check if campsite is available
        if (this.campsiteId) {
            return isCampsiteAvailable({
                campsiteId: this.campsiteId,
                startDate: this.booking.startDate,
                endDate: this.booking.endDate
            });
        }
        
        // If no campsite, check if all camping items are available
        if (this.campingItemIds && this.campingItemIds.length > 0) {
            const availabilityPromises = this.campingItemIds.map(itemId => {
                return isCampingItemAvailable({
                    campingItemId: itemId,
                    startDate: this.booking.startDate,
                    endDate: this.booking.endDate
                });
            });
            
            return Promise.all(availabilityPromises)
                .then(results => {
                    // All items must be available
                    return results.every(result => result === true);
                });
        }
        
        // If neither campsite nor camping items, return true
        return Promise.resolve(true);
    }
    
    createBooking() {
        this.isLoading = true;
        
        // Create booking object
        const bookingData = {
            trailId: this.trail ? this.trail.Id : null,
            campsiteId: this.campsiteId,
            campingItemIds: this.campingItemIds,
            startDate: this.booking.startDate,
            endDate: this.booking.endDate,
            numberOfPeople: this.booking.numberOfPeople,
            specialRequests: this.booking.specialRequests
        };
        
        createBooking({ bookingData: bookingData })
            .then(result => {
                this.bookingId = result;
                this.showSuccessMessage = true;
                
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Booking created successfully',
                        variant: 'success'
                    })
                );
                
                // Dispatch booking created event
                this.dispatchEvent(new CustomEvent('bookingcreated', {
                    detail: { bookingId: this.bookingId }
                }));
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body ? error.body.message : error.message,
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    validateForm() {
        // Check required fields
        const inputFields = this.template.querySelectorAll('lightning-input, lightning-textarea');
        let isValid = true;
        
        inputFields.forEach(field => {
            if (field.reportValidity() === false) {
                isValid = false;
            }
        });
        
        // Check if start date is before end date
        if (isValid && this.booking.startDate && this.booking.endDate) {
            const start = new Date(this.booking.startDate);
            const end = new Date(this.booking.endDate);
            
            if (start >= end) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'End date must be after start date',
                        variant: 'error'
                    })
                );
                isValid = false;
            }
        }
        
        // Check if terms are accepted
        if (isValid && !this.booking.termsAccepted) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'You must accept the terms and conditions',
                    variant: 'error'
                })
            );
            isValid = false;
        }
        
        return isValid;
    }
    
    handleViewBooking() {
        // Navigate to the booking record
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.bookingId,
                objectApiName: 'Rental__c',
                actionName: 'view'
            }
        });
    }
    
    handleNewBooking() {
        // Reset form for a new booking
        this.showSuccessMessage = false;
        this.bookingId = null;
        
        // Reset booking data
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        this.booking = {
            startDate: this.formatDateForInput(today),
            endDate: this.formatDateForInput(tomorrow),
            numberOfPeople: 1,
            specialRequests: '',
            termsAccepted: false
        };
        
        this.calculateTotalPrice();
    }
    
    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }
    
    get formattedTotalPrice() {
        return '$' + this.totalPrice.toFixed(2);
    }
    
    get showBookingDetails() {
        return (this.trail || this.campsite || (this.campingItems && this.campingItems.length > 0));
    }
    
    get showCampsiteDetails() {
        return this.campsite != null;
    }
    
    get showTrailDetails() {
        return this.trail != null;
    }
    
    get showCampingItemsDetails() {
        return this.campingItems && this.campingItems.length > 0;
    }
    
    get formTitle() {
        if (this.campsite) {
            return 'Book ' + this.campsite.Name;
        } else if (this.trail) {
            return 'Book Trail: ' + this.trail.Name;
        } else {
            return 'Book Camping Items';
        }
    }
}
