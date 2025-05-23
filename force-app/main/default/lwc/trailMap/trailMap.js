import { LightningElement, wire, track } from 'lwc';
import getTrails from '@salesforce/apex/TrailController.getTrails';

export default class TrailMap extends LightningElement {
    @track trails = [];
    @track error;
    @track mapMarkers = [];
    @track selectedMarkerValue;
    @track isLoading = true;

    // Map configuration
    zoomLevel = 10;
    markersTitle = 'Hiking Trails';
    showFooter = true;

    @wire(getTrails)
    wiredTrails({ error, data }) {
        this.isLoading = false;
        if (data) {
            this.trails = data;
            this.error = undefined;
            this.createMapMarkers();
        } else if (error) {
            this.error = error;
            this.trails = [];
            this.mapMarkers = [];
        }
    }

    createMapMarkers() {
        // In a real implementation, you would have latitude and longitude fields
        // For this example, we'll use the Location__c field or generate random coordinates
        this.mapMarkers = this.trails.map(trail => {
            let lat, lng;

            // Try to parse location from Location__c field
            if (trail.Location__c) {
                try {
                    const coords = trail.Location__c.split(',');
                    if (coords.length === 2) {
                        lat = parseFloat(coords[0].trim());
                        lng = parseFloat(coords[1].trim());
                    }
                } catch (error) {
                    console.error('Error parsing location:', error);
                }
            }

            // If parsing failed or no location, generate random coordinates
            if (isNaN(lat) || isNaN(lng)) {
                // Generate random coordinates around Sri Lanka
                lat = 7.8731 + (Math.random() - 0.5) * 2;
                lng = 80.7718 + (Math.random() - 0.5) * 2;
            }

            return {
                location: {
                    Latitude: lat,
                    Longitude: lng
                },
                title: trail.Name,
                description: `${trail.Difficulty__c} | ${trail.Distance_km__c} km`,
                icon: 'standard:location',
                value: trail.Id
            };
        });
    }

    handleMarkerSelect(event) {
        this.selectedMarkerValue = event.detail.selectedMarkerValue;

        // Dispatch event to notify parent component
        this.dispatchEvent(new CustomEvent('trailselect', {
            detail: { trailId: this.selectedMarkerValue }
        }));
    }
}
