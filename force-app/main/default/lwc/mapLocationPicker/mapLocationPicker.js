import { LightningElement, api, track } from 'lwc';

export default class MapLocationPicker extends LightningElement {
    @api label;
    @api value;
    @api placeholder = 'Search for a location...';
    @api required = false;
    @api helpText;
    @api fieldName;
    @api mapHeight = '300px';

    @track mapMarkers = [];
    @track center = {
        location: {
            Latitude: 7.8731,
            Longitude: 80.7718
        }
    };
    @track searchTerm = '';
    @track showSearchResults = false;
    @track searchResults = [];
    @track isLoading = false;
    @track error;

    connectedCallback() {
        // If value is provided, set the map marker
        if (this.value) {
            try {
                const [lat, lng] = this.value.split(',').map(coord => parseFloat(coord.trim()));
                if (!isNaN(lat) && !isNaN(lng)) {
                    this.setMarker(lat, lng);
                }
            } catch (error) {
                console.error('Error parsing location value:', error);
            }
        }

        // Load Google Maps API
        this.loadGoogleMapsApi();
    }

    loadGoogleMapsApi() {
        // In a real implementation, you would load the Google Maps API here
        // For this example, we'll assume it's already loaded
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;

        // Only search if there are at least 3 characters
        if (this.searchTerm.length >= 3) {
            this.searchLocations();
        } else {
            this.showSearchResults = false;
        }
    }

    searchLocations() {
        // In a real implementation, you would call the Google Places API here
        // For this example, we'll use dummy data
        this.isLoading = true;

        // Simulate API call
        setTimeout(() => {
            this.searchResults = [
                { id: '1', name: 'Sigiriya, Sri Lanka', lat: 7.9570, lng: 80.7603 },
                { id: '2', name: 'Kandy, Sri Lanka', lat: 7.2906, lng: 80.6337 },
                { id: '3', name: 'Colombo, Sri Lanka', lat: 6.9271, lng: 79.8612 }
            ];
            this.showSearchResults = true;
            this.isLoading = false;
        }, 1000);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selected = this.searchResults.find(result => result.id === selectedId);

        if (selected) {
            this.setMarker(selected.lat, selected.lng);
            this.searchTerm = `${selected.lat}, ${selected.lng}`;
            this.showSearchResults = false;

            // Dispatch change event
            this.dispatchChangeEvent();
        }
    }



    setMarker(lat, lng) {
        this.mapMarkers = [
            {
                location: {
                    Latitude: lat,
                    Longitude: lng
                },
                title: 'Selected Location',
                description: `${lat}, ${lng}`,
                value: `${lat},${lng}` // Add unique value for marker selection
            }
        ];

        this.center = {
            location: {
                Latitude: lat,
                Longitude: lng
            }
        };
    }

    dispatchChangeEvent() {
        if (this.mapMarkers.length > 0) {
            const location = this.mapMarkers[0].location;
            const value = `${location.Latitude}, ${location.Longitude}`;

            const changeEvent = new CustomEvent('change', {
                detail: {
                    value: value,
                    fieldName: this.fieldName
                }
            });

            this.dispatchEvent(changeEvent);
        }
    }

    handleMapClick(event) {
        // Simple fallback - use center coordinates when map is clicked
        const lat = this.center.location.Latitude + (Math.random() - 0.5) * 0.01;
        const lng = this.center.location.Longitude + (Math.random() - 0.5) * 0.01;

        this.setMarker(lat, lng);
        this.searchTerm = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        this.dispatchChangeEvent();
    }

    handleMarkerSelect(event) {
        // Handle marker selection
        if (event.detail && event.detail.selectedMarkerValue) {
            const marker = this.mapMarkers.find(m => m.value === event.detail.selectedMarkerValue);
            if (marker) {
                const lat = marker.location.Latitude;
                const lng = marker.location.Longitude;
                this.searchTerm = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            }
        }
    }

    handleBlur() {
        // Hide search results when input loses focus
        setTimeout(() => {
            this.showSearchResults = false;
        }, 300);
    }
}