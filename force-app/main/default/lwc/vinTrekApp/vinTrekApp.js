import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import isCurrentUserCamper from '@salesforce/apex/UserProfileService.isCurrentUserCamper';
import searchTrailsAndCampsites from '@salesforce/apex/TrailController.searchTrailsAndCampsites';
import getTrailWithCampsites from '@salesforce/apex/TrailController.getTrailWithCampsites';
import getRentalItems from '@salesforce/apex/TrailController.getRentalItems';
import getUserBookings from '@salesforce/apex/BookingController.getUserBookings';
import getWeatherAlert from '@salesforce/apex/WeatherController.getWeatherAlert';

export default class VinTrekApp extends NavigationMixin(LightningElement) {
    @track selectedTrailId;
    @track selectedCampsiteId;
    @track activeTab = 'trails';
    @track isLoading = true;
    @track error;
    @track hasAccess = false;
    @track cartItems = [];
    @track searchTerm = '';
    @track searchResults = null;
    @track selectedTrail = null;
    @track selectedCampsite = null;
    @track rentalItems = [];
    @track userBookings = [];
    @track weatherAlert = null;
    @track showWeatherAlert = false;

    // Wire the Apex method to check if user is a camper
    @wire(isCurrentUserCamper)
    wiredUserAccess({ error, data }) {
        this.isLoading = true;

        // TEMPORARY FIX: Always grant access for testing purposes
        this.hasAccess = true;
        this.error = undefined;

        // Original code (commented out for now)
        // if (data !== undefined) {
        //     this.hasAccess = data;
        //     this.error = undefined;
        // } else if (error) {
        //     this.error = error;
        //     this.hasAccess = false;
        //     console.error('Error checking user access:', error);
        // }

        this.isLoading = false;
    }

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

        // Load bookings when My Bookings tab is selected
        if (this.activeTab === 'bookings') {
            this.loadUserBookings();
        }
    }

    handleBookingCreated(event) {
        const bookingId = event.detail.bookingId;
        this.showToast('Success', 'Booking created successfully!', 'success');

        // Navigate to the booking record
        if (bookingId) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: bookingId,
                    actionName: 'view'
                }
            });
        }
    }

    handleCartUpdate(event) {
        this.cartItems = event.detail.cartItems;
        this.showToast('Cart Updated', `${this.cartItems.length} items in cart`, 'info');
    }

    handleBookCampsite(event) {
        const { campsiteId, cartItems } = event.detail;

        // Navigate to booking form
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__BookingForm'
            },
            state: {
                c__campsiteId: campsiteId,
                c__cartItemIds: cartItems.map(item => item.Id).join(',')
            }
        });
    }

    // Handle search input change
    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    // Handle search button click
    handleSearch() {
        if (this.searchTerm.length < 2) {
            this.showToast('Info', 'Please enter at least 2 characters to search', 'info');
            return;
        }

        this.isLoading = true;
        this.selectedTrail = null;
        this.selectedCampsite = null;

        // Check weather alert for search location
        this.checkWeatherForLocation();

        // Call Apex method to search trails and campsites
        searchTrailsAndCampsites({ searchTerm: this.searchTerm })
            .then(result => {
                if (result) {
                    this.searchResults = result;

                    // Process trail data to add UI enhancements
                    if (result.trails && result.trails.length > 0) {
                        this.showToast('Success', `Found ${result.trails.length} trails matching your search`, 'success');
                    } else if (result.campsites && result.campsites.length > 0) {
                        this.showToast('Success', `Found ${result.campsites.length} campsites matching your search`, 'success');
                    } else {
                        this.showToast('Info', 'No results found matching your search', 'info');
                    }
                }
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.searchResults = null;
                this.showToast('Error', 'Error searching trails and campsites', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Handle trail selection from search results
    handleTrailSelectFromSearch(event) {
        const trailId = event.currentTarget.dataset.id;
        this.isLoading = true;
        this.selectedCampsite = null;

        // Call Apex method to get trail with campsites
        getTrailWithCampsites({ trailId: trailId })
            .then(result => {
                if (result) {
                    this.selectedTrail = result;
                    this.showToast('Trail Selected', `You selected ${result.Name}`, 'success');
                }
            })
            .catch(error => {
                this.error = error;
                this.showToast('Error', 'Error loading trail details', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Handle campsite selection from trail details
    handleCampsiteSelectFromTrail(event) {
        const campsiteId = event.currentTarget.dataset.id;
        this.isLoading = true;

        // Get the campsite from the selected trail
        const campsite = this.selectedTrail.Campsites.find(c => c.Id === campsiteId);

        if (campsite) {
            this.selectedCampsite = campsite;

            // Get rental items
            getRentalItems()
                .then(items => {
                    if (items && items.length > 0) {
                        this.rentalItems = items;
                        this.showToast('Success', `Found ${items.length} rental items available`, 'success');
                    } else {
                        this.rentalItems = [];
                        this.showToast('Info', 'No rental items available', 'info');
                    }
                })
                .catch(error => {
                    this.error = error;
                    this.showToast('Error', 'Error loading rental items', 'error');
                })
                .finally(() => {
                    this.isLoading = false;
                });
        } else {
            this.isLoading = false;
            this.showToast('Error', 'Campsite not found', 'error');
        }
    }

    // Handle adding rental item to cart
    handleAddToCart(event) {
        const itemId = event.currentTarget.dataset.id;
        const item = this.rentalItems.find(item => item.Id === itemId);

        if (item) {
            // Check if item is already in cart
            const existingItem = this.cartItems.find(cartItem => cartItem.Id === itemId);

            if (existingItem) {
                existingItem.quantity += 1;
                this.showToast('Cart Updated', `Added another ${item.Name} to cart (${existingItem.quantity} total)`, 'success');
            } else {
                this.cartItems.push({
                    ...item,
                    quantity: 1
                });
                this.showToast('Item Added', `${item.Name} added to cart`, 'success');
            }
        }
    }

    // Handle booking campsite with rental items
    handleBookCampsiteWithItems() {
        if (!this.selectedCampsite) {
            this.showToast('Error', 'Please select a campsite first', 'error');
            return;
        }

        if (this.cartItems.length === 0) {
            this.showToast('Info', 'No rental items in cart. Do you want to continue?', 'info');
        }

        // Navigate to booking form
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__BookingForm'
            },
            state: {
                c__campsiteId: this.selectedCampsite.Id,
                c__cartItemIds: this.cartItems.map(item => item.Id).join(',')
            }
        });
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

    // Load user bookings
    loadUserBookings() {
        this.isLoading = true;
        getUserBookings()
            .then(result => {
                this.userBookings = result.map(booking => ({
                    ...booking,
                    formattedStartDate: new Date(booking.Start_Date__c).toLocaleDateString(),
                    formattedEndDate: new Date(booking.End_Date__c).toLocaleDateString(),
                    statusClass: this.getBookingStatusClass(booking.Status__c),
                    trailName: booking.Trail__r ? booking.Trail__r.Name : 'N/A',
                    campsiteName: booking.Campsite__r ? booking.Campsite__r.Name : 'N/A'
                }));
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.userBookings = [];
                this.showToast('Error', 'Error loading bookings', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Get booking status CSS class
    getBookingStatusClass(status) {
        switch(status) {
            case 'Confirmed': return 'slds-badge slds-theme_success';
            case 'Pending': return 'slds-badge slds-theme_warning';
            case 'Cancelled': return 'slds-badge slds-theme_error';
            default: return 'slds-badge';
        }
    }

    // Check weather for search location
    checkWeatherForLocation() {
        if (this.searchTerm) {
            getWeatherAlert({ location: this.searchTerm })
                .then(result => {
                    if (result && result.hasAlert) {
                        this.weatherAlert = {
                            location: this.searchTerm,
                            message: result.message,
                            severity: result.severity,
                            alertClass: this.getWeatherAlertClass(result.severity)
                        };
                        this.showWeatherAlert = true;
                    } else {
                        this.showWeatherAlert = false;
                    }
                })
                .catch(error => {
                    console.error('Weather alert error:', error);
                    this.showWeatherAlert = false;
                });
        }
    }

    // Get weather alert CSS class
    getWeatherAlertClass(severity) {
        switch(severity) {
            case 'High': return 'slds-notify slds-notify_alert slds-theme_error';
            case 'Medium': return 'slds-notify slds-notify_alert slds-theme_warning';
            case 'Low': return 'slds-notify slds-notify_alert slds-theme_info';
            default: return 'slds-notify slds-notify_alert';
        }
    }

    // Close weather alert
    closeWeatherAlert() {
        this.showWeatherAlert = false;
    }

    // Handle explore trails button click
    handleExploreTrails() {
        this.activeTab = 'trails';
    }
}