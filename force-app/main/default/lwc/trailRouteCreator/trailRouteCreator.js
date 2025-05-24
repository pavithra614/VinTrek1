import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import saveTrail from '@salesforce/apex/TrailController.saveTrail';

const DIFFICULTY_OPTIONS = [
    { label: 'Easy', value: 'Easy' },
    { label: 'Moderate', value: 'Moderate' },
    { label: 'Difficult', value: 'Difficult' },
    { label: 'Very Difficult', value: 'Very Difficult' }
];

export default class TrailRouteCreator extends NavigationMixin(LightningElement) {
    @track isLoading = false;
    @track error;
    @track startLocation;
    @track endLocation;
    @track showRouteMap = false;
    @track routeMapMarkers = [];
    @track routeDistance = 0;
    @track routeElevation = 0;
    @track routeData = null;
    @track showSaveModal = false;
    @track trailName = '';
    @track trailDescription = '';
    @track trailDifficulty = 'Moderate';
    @track trailLocation = '';

    difficultyOptions = DIFFICULTY_OPTIONS;

    get isGenerateDisabled() {
        return !this.startLocation || !this.endLocation;
    }

    get mapCenter() {
        if (this.startLocation) {
            const [lat, lng] = this.startLocation.split(',').map(coord => parseFloat(coord.trim()));
            return {
                location: {
                    Latitude: lat,
                    Longitude: lng
                }
            };
        }
        return {
            location: {
                Latitude: 7.8731, // Default to Sri Lanka
                Longitude: 80.7718
            }
        };
    }

    handleStartLocationChange(event) {
        this.startLocation = event.detail.value;
    }

    handleEndLocationChange(event) {
        this.endLocation = event.detail.value;
    }

    handleGenerateRoute() {
        if (!this.startLocation || !this.endLocation) {
            this.error = 'Please select both start and end locations.';
            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            // Parse start and end locations
            const [startLat, startLng] = this.startLocation.split(',').map(coord => parseFloat(coord.trim()));
            const [endLat, endLng] = this.endLocation.split(',').map(coord => parseFloat(coord.trim()));

            // In a real implementation, you would call a routing service API here
            // For this example, we'll simulate a route with a straight line and some waypoints

            // Create route markers
            this.createRouteMarkers(startLat, startLng, endLat, endLng);

            // Calculate mock distance and elevation
            this.calculateRouteStats(startLat, startLng, endLat, endLng);

            // Show the route map
            this.showRouteMap = true;

            // Set default trail location
            this.trailLocation = `${startLat.toFixed(4)}, ${startLng.toFixed(4)}`;
        } catch (error) {
            this.error = 'Error generating route: ' + error.message;
            console.error('Error generating route:', error);
        } finally {
            this.isLoading = false;
        }
    }

    createRouteMarkers(startLat, startLng, endLat, endLng) {
        // Create start and end markers
        const markers = [
            {
                location: {
                    Latitude: startLat,
                    Longitude: startLng
                },
                title: 'Start',
                description: 'Trail Start Point',
                icon: 'standard:location'
            },
            {
                location: {
                    Latitude: endLat,
                    Longitude: endLng
                },
                title: 'End',
                description: 'Trail End Point',
                icon: 'standard:location'
            }
        ];

        // Add some waypoints along the route
        const numWaypoints = 3;
        for (let i = 1; i <= numWaypoints; i++) {
            const ratio = i / (numWaypoints + 1);
            const lat = startLat + (endLat - startLat) * ratio;
            const lng = startLng + (endLng - startLng) * ratio;

            // Add some randomness to make it look like a real route
            const latOffset = (Math.random() - 0.5) * 0.01;
            const lngOffset = (Math.random() - 0.5) * 0.01;

            markers.push({
                location: {
                    Latitude: lat + latOffset,
                    Longitude: lng + lngOffset
                },
                title: `Waypoint ${i}`,
                description: `Trail Waypoint ${i}`,
                icon: 'standard:location'
            });
        }

        this.routeMapMarkers = markers;

        // Store route data for saving
        this.routeData = JSON.stringify({
            start: { lat: startLat, lng: startLng },
            end: { lat: endLat, lng: endLng },
            waypoints: markers.slice(2).map(marker => ({
                lat: marker.location.Latitude,
                lng: marker.location.Longitude
            }))
        });
    }

    calculateRouteStats(startLat, startLng, endLat, endLng) {
        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(endLat - startLat);
        const dLon = this.toRad(endLng - startLng);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRad(startLat)) * Math.cos(this.toRad(endLat)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        // Round to 2 decimal places
        this.routeDistance = Math.round(distance * 100) / 100;

        // Generate a random elevation gain (in a real app, this would come from elevation data)
        this.routeElevation = Math.round(distance * 50 + Math.random() * 200);
    }

    toRad(value) {
        return value * Math.PI / 180;
    }

    handleSaveTrail() {
        this.showSaveModal = true;
    }

    handleModalClose() {
        this.showSaveModal = false;
    }

    handleTrailNameChange(event) {
        this.trailName = event.target.value;
    }

    handleTrailDescriptionChange(event) {
        this.trailDescription = event.target.value;
    }

    handleTrailDifficultyChange(event) {
        this.trailDifficulty = event.target.value;
    }

    handleTrailLocationChange(event) {
        this.trailLocation = event.target.value;
    }

    handleSaveTrailSubmit() {
        if (!this.trailName) {
            this.showToast('Error', 'Please enter a trail name', 'error');
            return;
        }

        this.isLoading = true;

        // Parse start and end locations
        const [startLat, startLng] = this.startLocation.split(',').map(coord => parseFloat(coord.trim()));
        const [endLat, endLng] = this.endLocation.split(',').map(coord => parseFloat(coord.trim()));

        // Create trail object
        const trail = {
            Name: this.trailName,
            Description__c: this.trailDescription,
            Difficulty__c: this.trailDifficulty,
            Distance_km__c: this.routeDistance,
            Elevation_m__c: this.routeElevation,
            Location__c: this.trailLocation,
            Start_Latitude__c: startLat,
            Start_Longitude__c: startLng,
            End_Latitude__c: endLat,
            End_Longitude__c: endLng,
            Route_Data__c: this.routeData
        };

        // Save trail
        saveTrail({ trail: trail })
            .then(result => {
                this.showToast('Success', 'Trail created successfully', 'success');
                this.showSaveModal = false;

                // Navigate to the trail admin page
                this[NavigationMixin.Navigate]({
                    type: 'standard__component',
                    attributes: {
                        componentName: 'c__trailAdmin'
                    }
                });
            })
            .catch(error => {
                this.showToast('Error', 'Error creating trail: ' + error.body.message, 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

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
