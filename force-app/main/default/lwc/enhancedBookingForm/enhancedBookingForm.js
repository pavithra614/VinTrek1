import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import createBooking from '@salesforce/apex/BookingController.createBooking';
import getDefaultCampsiteId from '@salesforce/apex/BookingController.getDefaultCampsiteId';
// import getWeatherForecast from '@salesforce/apex/WeatherService.getWeatherForecast';
import userId from '@salesforce/user/Id';

export default class EnhancedBookingForm extends NavigationMixin(LightningElement) {
    @api trailId;
    @api campsiteId;
    @api campingItemIds = [];
    @api cartItems = [];
    @api showAvailabilityCalendar = false;

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
    @track totalPrice = 0;
    @track numberOfDays = 0;
    @track showSuccessMessage = false;
    @track bookingId;
    @track currentStep = 'booking';
    @track weatherData;
    @track showWeatherAlert = false;

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

        // For now, create mock data for campsite and trail
        if (this.campsiteId) {
            this.campsite = {
                Id: this.campsiteId,
                Name: 'Selected Campsite',
                Daily_Fee__c: 25.00,
                Description__c: 'A beautiful campsite for your adventure'
            };
        } else {
            // Default to Eagle's Nest campsite
            this.campsite = {
                Id: 'a01gL0000076gADQAY',
                Name: "Eagle's Nest",
                Daily_Fee__c: 25.00,
                Description__c: 'Perched high with amazing views of the valley'
            };
        }

        if (this.trailId) {
            this.trail = {
                Id: this.trailId,
                Name: 'Selected Trail',
                Description__c: 'An amazing trail for hiking'
            };
        }

        // If cart items are provided, use them directly
        if (this.cartItems && this.cartItems.length > 0) {
            this.campingItems = this.cartItems;
        }

        this.calculateTotalPrice();
        this.isLoading = false;
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
                if (item.Daily_Rate__c) {
                    total += item.Daily_Rate__c * this.numberOfDays * (item.quantity || 1);
                } else if (item.Daily_Fee__c) {
                    total += item.Daily_Fee__c * this.numberOfDays * (item.quantity || 1);
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
        console.log('handleSubmit called, currentStep:', this.currentStep);

        // Validate form
        if (!this.validateForm()) {
            console.log('Form validation failed');
            return;
        }

        console.log('Form validation passed, proceeding to weather step');
        // Proceed to weather step instead of creating booking directly
        this.proceedToWeatherStep();
    }

    proceedToWeatherStep() {
        console.log('proceedToWeatherStep called');
        this.isLoading = true;
        this.currentStep = 'weather';
        console.log('currentStep set to:', this.currentStep);

        // Get weather forecast for the selected dates and location
        // For demo purposes, use mock coordinates if campsite doesn't have them
        const latitude = (this.campsite && this.campsite.Latitude__c) ? this.campsite.Latitude__c : 7.2906;
        const longitude = (this.campsite && this.campsite.Longitude__c) ? this.campsite.Longitude__c : 80.6337;
        console.log('Using coordinates:', latitude, longitude);

        // Temporarily simulate weather check for testing
        setTimeout(() => {
            console.log('Simulating weather check...');
            // Mock weather data with realistic rainy day scenarios
            const weatherScenarios = [
                // Rainy day scenarios (70% chance)
                {
                    alerts: [
                        {
                            title: 'Heavy Rain Warning',
                            description: 'Heavy rainfall expected from 2 PM to 8 PM today. Trails may become slippery and muddy. Consider waterproof gear or rescheduling your camping trip.'
                        }
                    ],
                    current: {
                        temp: 24,
                        humidity: 85,
                        weather: 'Heavy Rain',
                        windSpeed: 15
                    }
                },
                {
                    alerts: [
                        {
                            title: 'Thunderstorm Alert',
                            description: 'Severe thunderstorms with lightning expected between 4 PM - 10 PM. Outdoor activities are not recommended during this period. Seek shelter immediately if camping.'
                        }
                    ],
                    current: {
                        temp: 26,
                        humidity: 90,
                        weather: 'Thunderstorm',
                        windSpeed: 25
                    }
                },
                {
                    alerts: [
                        {
                            title: 'Monsoon Warning',
                            description: 'Continuous rainfall expected for the next 24 hours due to monsoon activity. River levels may rise. Avoid camping near water bodies and low-lying areas.'
                        }
                    ],
                    current: {
                        temp: 23,
                        humidity: 95,
                        weather: 'Monsoon Rain',
                        windSpeed: 20
                    }
                },
                {
                    alerts: [
                        {
                            title: 'Flash Flood Risk',
                            description: 'Heavy rains may cause flash flooding in mountainous areas. Avoid camping in valleys or near streams. Monitor weather updates closely.'
                        }
                    ],
                    current: {
                        temp: 25,
                        humidity: 88,
                        weather: 'Heavy Rain',
                        windSpeed: 18
                    }
                },
                // Good weather scenarios (30% chance)
                {
                    alerts: [],
                    current: {
                        temp: 28,
                        humidity: 65,
                        weather: 'Partly Cloudy',
                        windSpeed: 8
                    }
                },
                {
                    alerts: [],
                    current: {
                        temp: 30,
                        humidity: 60,
                        weather: 'Clear Sky',
                        windSpeed: 5
                    }
                }
            ];

            // Select random weather scenario (weighted towards rainy weather for demo)
            const randomIndex = Math.random() < 0.7 ?
                Math.floor(Math.random() * 4) : // 70% chance of rainy weather (first 4 scenarios)
                Math.floor(Math.random() * 2) + 4; // 30% chance of good weather (last 2 scenarios)

            this.weatherData = weatherScenarios[randomIndex];
            console.log('Selected weather scenario:', this.weatherData);

            this.checkWeatherAlerts();
            this.isLoading = false;
        }, 1500); // Increased to 1.5 seconds for more realistic loading

        // Original weather service call (commented for testing)
        /*
        getWeatherForecast({
            latitude: latitude,
            longitude: longitude,
            startDate: this.booking.startDate,
            endDate: this.booking.endDate
        })
        .then(result => {
            this.weatherData = result;
            this.checkWeatherAlerts();
            this.isLoading = false;
        })
        .catch(error => {
            console.error('Weather fetch error:', error);
            this.isLoading = false;
            // Continue without weather data - show success message
            this.showWeatherAlert = false;
            setTimeout(() => {
                this.proceedToCheckout();
            }, 2000);
        });
        */
    }

    checkWeatherAlerts() {
        if (this.weatherData && this.weatherData.alerts && this.weatherData.alerts.length > 0) {
            this.showWeatherAlert = true;
        } else {
            // Auto-proceed to checkout after 5 seconds if no alerts (increased time to view weather)
            setTimeout(() => {
                this.proceedToCheckout();
            }, 5000);
        }
    }

    handleWeatherContinue() {
        this.showWeatherAlert = false;
        this.proceedToCheckout();
    }

    proceedToCheckout() {
        this.currentStep = 'checkout';
    }

    handlePaymentComplete() {
        this.createBooking();
    }

    handleBackToBooking() {
        this.currentStep = 'booking';
        this.showWeatherAlert = false;
        this.weatherData = null;
    }

    handleBackToWeather() {
        this.currentStep = 'weather';
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

        // Create booking object - use first available campsite if none specified
        // Ensure we're using a valid campsite ID (starts with 'a01') not a camping item ID (starts with '02i')
        let validCampsiteId = null;

        if (this.campsiteId && this.campsiteId.startsWith('a01')) {
            validCampsiteId = this.campsiteId;
        } else {
            // Get default campsite if invalid or no campsite provided
            console.warn('Invalid or no campsite ID provided:', this.campsiteId);
            getDefaultCampsiteId()
                .then(defaultId => {
                    if (defaultId) {
                        validCampsiteId = defaultId;
                        this.proceedWithBookingCreation(validCampsiteId);
                    } else {
                        this.isLoading = false;
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error',
                                message: 'No valid campsite available. Please select a campsite manually.',
                                variant: 'error'
                            })
                        );
                    }
                })
                .catch(error => {
                    this.isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Error getting default campsite: ' + (error.body ? error.body.message : error.message),
                            variant: 'error'
                        })
                    );
                });
            return; // Exit early to wait for async call
        }

        // Proceed with booking using the original or validated campsite ID
        this.proceedWithBookingCreation(validCampsiteId);
    }

    proceedWithBookingCreation(validCampsiteId) {
        const bookingData = {
            trailId: this.trail ? this.trail.Id : null,
            campsiteId: validCampsiteId,
            campingItemIds: this.campingItemIds.length > 0 ? this.campingItemIds :
                           (this.cartItems && this.cartItems.length > 0 ? this.cartItems.map(item => item.Id) : []),
            startDate: this.booking.startDate,
            endDate: this.booking.endDate,
            numberOfPeople: this.booking.numberOfPeople,
            specialRequests: this.booking.specialRequests
        };

        // Debug logging
        console.log('Enhanced Booking Data:', JSON.stringify(bookingData, null, 2));
        console.log('Original CampsiteId:', this.campsiteId);
        console.log('Valid CampsiteId:', validCampsiteId);
        console.log('CartItems:', this.cartItems);
        console.log('CampingItemIds:', this.campingItemIds);

        createBooking({ bookingData: bookingData })
            .then(result => {
                this.bookingId = result;
                this.currentStep = 'confirmation';
                this.showSuccessMessage = true;

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Booking created successfully',
                        variant: 'success'
                    })
                );

                // Dispatch booking created event (commented out to prevent auto-navigation)
                // this.dispatchEvent(new CustomEvent('bookingcreated', {
                //     detail: { bookingId: this.bookingId }
                // }));
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

    // Removed unused step methods

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

    get hasWeatherAlerts() {
        return this.weatherData && this.weatherData.alerts && this.weatherData.alerts.length > 0;
    }

    get weatherAlertTitle() {
        if (this.hasWeatherAlerts) {
            const firstAlert = this.weatherData.alerts[0];
            return firstAlert.title || 'Weather Alert';
        }
        return '';
    }

    get weatherAlertMessage() {
        if (this.hasWeatherAlerts) {
            const firstAlert = this.weatherData.alerts[0];
            return firstAlert.description || firstAlert.title || 'Weather alert for your selected dates.';
        }
        return '';
    }

    // Weather data getters
    get currentTemp() {
        return this.weatherData && this.weatherData.current ? this.weatherData.current.temp : '--';
    }

    get currentHumidity() {
        return this.weatherData && this.weatherData.current ? this.weatherData.current.humidity : '--';
    }

    get currentWindSpeed() {
        return this.weatherData && this.weatherData.current ? this.weatherData.current.windSpeed : '--';
    }

    get currentWeather() {
        return this.weatherData && this.weatherData.current ? this.weatherData.current.weather : '--';
    }

    get stepProgress() {
        const steps = ['booking', 'weather', 'checkout', 'confirmation'];
        const currentIndex = steps.indexOf(this.currentStep);
        return ((currentIndex + 1) / steps.length) * 100;
    }

    get bookingStepClass() {
        return this.currentStep === 'booking' ? 'slds-progress__item slds-is-active' :
               this.isStepCompleted('booking') ? 'slds-progress__item slds-is-completed' : 'slds-progress__item';
    }

    get weatherStepClass() {
        return this.currentStep === 'weather' ? 'slds-progress__item slds-is-active' :
               this.isStepCompleted('weather') ? 'slds-progress__item slds-is-completed' : 'slds-progress__item';
    }

    get checkoutStepClass() {
        return this.currentStep === 'checkout' ? 'slds-progress__item slds-is-active' :
               this.isStepCompleted('checkout') ? 'slds-progress__item slds-is-completed' : 'slds-progress__item';
    }

    get confirmationStepClass() {
        return this.currentStep === 'confirmation' ? 'slds-progress__item slds-is-active' :
               this.isStepCompleted('confirmation') ? 'slds-progress__item slds-is-completed' : 'slds-progress__item';
    }

    isStepCompleted(step) {
        const steps = ['booking', 'weather', 'checkout', 'confirmation'];
        const currentIndex = steps.indexOf(this.currentStep);
        const stepIndex = steps.indexOf(step);
        return currentIndex > stepIndex;
    }

    // Step visibility getters
    get showBookingStep() {
        const show = this.currentStep === 'booking';
        console.log('showBookingStep:', show, 'currentStep:', this.currentStep);
        return show;
    }

    get showWeatherStep() {
        const show = this.currentStep === 'weather';
        console.log('showWeatherStep:', show, 'currentStep:', this.currentStep);
        return show;
    }

    get showCheckoutStep() {
        return this.currentStep === 'checkout';
    }

    get showConfirmationStep() {
        return this.currentStep === 'confirmation';
    }
}
