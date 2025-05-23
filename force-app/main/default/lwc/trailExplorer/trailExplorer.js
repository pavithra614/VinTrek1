import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTrails from '@salesforce/apex/TrailController.getTrails';

export default class TrailExplorer extends LightningElement {
    @track trails = [];
    @track filteredTrails = [];
    @track error;
    @track selectedTrail;
    @track isLoading = true;
    @track filterOptions = {
        difficulty: 'All',
        minDistance: 0,
        maxDistance: 100
    };

    // Trail background images (would be replaced with actual trail images)
    trailBackgrounds = [
        'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1527489377706-5bf97e608852?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1500534623283-312aade485b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ];

    difficultyOptions = [
        { label: 'All', value: 'All' },
        { label: 'Easy', value: 'Easy' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'Difficult', value: 'Difficult' },
        { label: 'Very Difficult', value: 'Very Difficult' }
    ];

    @wire(getTrails)
    wiredTrails({ error, data }) {
        this.isLoading = true;
        if (data) {
            // Process trail data to add UI enhancements
            this.trails = data.map((trail, index) => {
                const backgroundIndex = index % this.trailBackgrounds.length;
                return {
                    ...trail,
                    backgroundStyle: `background-image: url(${this.trailBackgrounds[backgroundIndex]})`,
                    difficultyClass: this.getDifficultyClass(trail.Difficulty__c)
                };
            });
            this.filteredTrails = [...this.trails];
            this.error = undefined;
            this.applyFilters();
        } else if (error) {
            this.error = error;
            this.trails = [];
            this.filteredTrails = [];
            this.showToast('Error', 'Error loading trails', 'error');
        }
        this.isLoading = false;
    }

    handleDifficultyChange(event) {
        this.filterOptions.difficulty = event.detail.value;
        this.applyFilters();
    }

    handleMinDistanceChange(event) {
        this.filterOptions.minDistance = event.target.value;
        this.applyFilters();
    }

    handleMaxDistanceChange(event) {
        this.filterOptions.maxDistance = event.target.value;
        this.applyFilters();
    }

    applyFilters() {
        const { difficulty, minDistance, maxDistance } = this.filterOptions;

        this.filteredTrails = this.trails.filter(trail => {
            // Filter by difficulty
            if (difficulty !== 'All' && trail.Difficulty__c !== difficulty) {
                return false;
            }

            // Filter by distance
            const distance = trail.Distance_km__c;
            if (distance < minDistance || (maxDistance > 0 && distance > maxDistance)) {
                return false;
            }

            return true;
        });

        // If a trail was selected but is now filtered out, clear the selection
        if (this.selectedTrail && !this.filteredTrails.some(trail => trail.Id === this.selectedTrail.Id)) {
            this.selectedTrail = null;
        }
    }

    handleTrailSelect(event) {
        const trailId = event.currentTarget.dataset.id;
        const trail = this.trails.find(trail => trail.Id === trailId);

        if (trail) {
            this.selectedTrail = {
                ...trail,
                // Add estimated time based on distance and difficulty
                estimatedTime: this.calculateEstimatedTime(trail)
            };

            // Dispatch event to parent component
            const selectEvent = new CustomEvent('trailselect', {
                detail: { trailId: trailId }
            });
            this.dispatchEvent(selectEvent);

            // Show toast notification
            this.showToast('Trail Selected', `You selected ${trail.Name}`, 'success');
        }
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

    // Helper method to calculate estimated hiking time
    calculateEstimatedTime(trail) {
        // Average walking speed in km/h based on difficulty
        let speed;
        switch(trail.Difficulty__c) {
            case 'Easy':
                speed = 4.0;
                break;
            case 'Moderate':
                speed = 3.5;
                break;
            case 'Difficult':
                speed = 3.0;
                break;
            case 'Very Difficult':
                speed = 2.5;
                break;
            default:
                speed = 3.5;
        }

        // Calculate time in hours
        const timeInHours = trail.Distance_km__c / speed;

        // Convert to hours and minutes
        const hours = Math.floor(timeInHours);
        const minutes = Math.round((timeInHours - hours) * 60);

        return hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes}m`;
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

    // Computed properties for selected trail
    get selectedTrailBackgroundStyle() {
        return this.selectedTrail
            ? `background-image: url(${this.selectedTrail.backgroundStyle.split('url(')[1].split(')')[0]})`
            : '';
    }

    get selectedTrailDifficultyClass() {
        return this.selectedTrail
            ? this.selectedTrail.difficultyClass
            : '';
    }

    get estimatedTime() {
        return this.selectedTrail
            ? this.selectedTrail.estimatedTime
            : '';
    }
}