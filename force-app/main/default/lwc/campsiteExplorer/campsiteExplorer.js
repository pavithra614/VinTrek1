import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchTrailsAndCampsites from '@salesforce/apex/CampsiteController.searchTrailsAndCampsites';
import getTrailWithCampsites from '@salesforce/apex/CampsiteController.getTrailWithCampsites';
import getCampsiteWithRentalItems from '@salesforce/apex/CampsiteController.getCampsiteWithRentalItems';
import getRentalItems from '@salesforce/apex/CampsiteController.getRentalItems';

export default class CampsiteExplorer extends LightningElement {
    @track searchTerm = '';
    @track isLoading = false;
    @track error;
    @track filteredTrails = [];
    @track selectedTrail;
    @track selectedCampsite;
    @track rentalItems = [];
    @track cartItems = [];

    // Trail background images (would be replaced with actual trail images)
    trailBackgrounds = [
        'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1527489377706-5bf97e608852?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1500534623283-312aade485b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ];

    // Campsite background images
    campsiteBackgrounds = [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1517824806704-9040b037703b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ];

    // Rental item background images
    rentalItemBackgrounds = [
        'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Tent
        'https://images.unsplash.com/photo-1475619690928-0f6830403764?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Sleeping bag
        'https://images.unsplash.com/photo-1522057306606-8d84b31e2c66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Stove
        'https://images.unsplash.com/photo-1575377427642-087cf684f29d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Grill
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'  // Cooler
    ];

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

        // Call Apex method to search trails and campsites
        searchTrailsAndCampsites({ searchTerm: this.searchTerm })
            .then(result => {
                if (result && result.trails) {
                    // Process trail data to add UI enhancements
                    this.filteredTrails = result.trails.map((trail, index) => {
                        const backgroundIndex = index % this.trailBackgrounds.length;
                        return {
                            ...trail,
                            backgroundStyle: `background-image: url(${this.trailBackgrounds[backgroundIndex]})`,
                            difficultyClass: this.getDifficultyClass(trail.Difficulty__c)
                        };
                    });
                } else {
                    this.filteredTrails = [];
                }
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.filteredTrails = [];
                this.showToast('Error', 'Error searching trails and campsites', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Handle trail selection
    handleTrailSelect(event) {
        const trailId = event.currentTarget.dataset.id;
        this.isLoading = true;
        this.selectedCampsite = null;

        // Call Apex method to get trail with campsites
        getTrailWithCampsites({ trailId: trailId })
            .then(result => {
                if (result) {
                    // Process trail and campsites data
                    const trail = {
                        ...result,
                        backgroundStyle: `background-image: url(${this.trailBackgrounds[0]})`,
                        difficultyClass: this.getDifficultyClass(result.Difficulty__c)
                    };

                    // Process campsites
                    if (trail.Campsites) {
                        trail.Campsites__r = trail.Campsites.map((campsite, index) => {
                            const backgroundIndex = index % this.campsiteBackgrounds.length;
                            return {
                                ...campsite,
                                backgroundStyle: `background-image: url(${this.campsiteBackgrounds[backgroundIndex]})`,
                                capacityLabel: `Capacity: ${campsite.Capacity__c}`
                            };
                        });
                    } else {
                        trail.Campsites__r = [];
                    }

                    this.selectedTrail = trail;

                    // Dispatch event to parent component
                    const selectEvent = new CustomEvent('trailselect', {
                        detail: { trailId: trailId }
                    });
                    this.dispatchEvent(selectEvent);

                    // Show toast notification
                    this.showToast('Trail Selected', `You selected ${trail.Name}`, 'success');
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

    // Handle campsite selection
    handleCampsiteSelect(event) {
        const campsiteId = event.currentTarget.dataset.id;
        this.isLoading = true;

        // Call Apex method to get campsite with rental items
        getCampsiteWithRentalItems({ campsiteId: campsiteId })
            .then(result => {
                if (result) {
                    // Process campsite data
                    const campsite = {
                        ...result,
                        backgroundStyle: `background-image: url(${this.campsiteBackgrounds[0]})`,
                        capacityLabel: `Capacity: ${result.Capacity__c}`
                    };

                    // Get rental items separately
                    return getRentalItems().then(items => {
                        if (items && items.length > 0) {
                            this.rentalItems = items.map((item, index) => {
                                const backgroundIndex = index % this.rentalItemBackgrounds.length;
                                return {
                                    ...item,
                                    backgroundStyle: `background-image: url(${this.rentalItemBackgrounds[backgroundIndex]})`
                                };
                            });
                        } else {
                            this.rentalItems = [];
                        }

                        this.selectedCampsite = campsite;

                        // Dispatch event to parent component
                        const selectEvent = new CustomEvent('campsiteselect', {
                            detail: { campsiteId: campsiteId }
                        });
                        this.dispatchEvent(selectEvent);

                        // Show toast notification
                        this.showToast('Campsite Selected', `You selected ${campsite.Name}`, 'success');
                    });
                }
            })
            .catch(error => {
                this.error = error;
                this.showToast('Error', 'Error loading campsite details', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
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
            } else {
                this.cartItems.push({
                    ...item,
                    quantity: 1
                });
            }

            // Show toast notification
            this.showToast('Item Added', `${item.Name} added to cart`, 'success');

            // Dispatch event to parent component
            const cartEvent = new CustomEvent('cartupdate', {
                detail: { cartItems: this.cartItems }
            });
            this.dispatchEvent(cartEvent);
        }
    }

    // Handle booking campsite
    handleBookCampsite() {
        // Dispatch event to parent component
        const bookEvent = new CustomEvent('bookcampsite', {
            detail: {
                campsiteId: this.selectedCampsite.Id,
                cartItems: this.cartItems
            }
        });
        this.dispatchEvent(bookEvent);

        // Show toast notification
        this.showToast('Booking', 'Proceeding to booking form', 'info');
    }

    // Helper method to get CSS class for difficulty badge
    getDifficultyClass(difficulty) {
        switch(difficulty) {
            case 'Easy':
                return 'badge-easy';
            case 'Moderate':
                return 'badge-moderate';
            case 'Difficult':
            case 'Very Difficult':
                return 'badge-difficult';
            default:
                return '';
        }
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

    // Computed properties
    get showTrailResults() {
        return this.filteredTrails.length > 0 && !this.selectedTrail;
    }

    get showNoResults() {
        return this.searchTerm && this.filteredTrails.length === 0 && !this.isLoading && !this.selectedTrail && !this.selectedCampsite;
    }

    get selectedTrailBackgroundStyle() {
        return this.selectedTrail ? this.selectedTrail.backgroundStyle : '';
    }

    get selectedTrailDifficultyClass() {
        return this.selectedTrail ? this.selectedTrail.difficultyClass : '';
    }

    get selectedCampsiteBackgroundStyle() {
        return this.selectedCampsite ? this.selectedCampsite.backgroundStyle : '';
    }
}
