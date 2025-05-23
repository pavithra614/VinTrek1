import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LocationSelector extends LightningElement {
    @api
    get latitude() {
        return this._latitude;
    }
    set latitude(value) {
        this._latitude = value;
        this.updateMapMarker();
    }

    @api
    get longitude() {
        return this._longitude;
    }
    set longitude(value) {
        this._longitude = value;
        this.updateMapMarker();
    }

    @track _latitude = 7.8731; // Default to Sri Lanka
    @track _longitude = 80.7718;
    @track mapMarkers = [];
    @track zoomLevel = 10;

    connectedCallback() {
        this.updateMapMarker();
    }

    get mapCenter() {
        return {
            location: {
                Latitude: this._latitude,
                Longitude: this._longitude
            }
        };
    }

    updateMapMarker() {
        if (this._latitude && this._longitude) {
            this.mapMarkers = [
                {
                    location: {
                        Latitude: this._latitude,
                        Longitude: this._longitude
                    },
                    title: 'Campsite Location',
                    description: `Latitude: ${this._latitude}, Longitude: ${this._longitude}`,
                    icon: 'standard:location',
                    draggable: true
                }
            ];
        }
    }

    handleLatitudeChange(event) {
        this._latitude = parseFloat(event.target.value);
        this.updateMapMarker();
        this.dispatchLocationChangeEvent();
    }

    handleLongitudeChange(event) {
        this._longitude = parseFloat(event.target.value);
        this.updateMapMarker();
        this.dispatchLocationChangeEvent();
    }

    handleMarkerSelect(event) {
        // When a marker is selected, we can get its location
        const selectedMarker = event.detail.selectedMarkerValue;
        // Additional logic if needed
    }

    handleMarkerDrag(event) {
        // When a marker is dragged, update the latitude and longitude
        const location = event.detail.location;
        this._latitude = location.Latitude;
        this._longitude = location.Longitude;
        this.dispatchLocationChangeEvent();
    }

    handleMapClick(event) {
        // When the map is clicked, update the marker position
        const mapLocation = event.detail.location;
        this._latitude = mapLocation.latitude;
        this._longitude = mapLocation.longitude;
        this.updateMapMarker();
        this.dispatchLocationChangeEvent();
    }

    handleUseCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this._latitude = position.coords.latitude;
                    this._longitude = position.coords.longitude;
                    this.updateMapMarker();
                    this.dispatchLocationChangeEvent();
                },
                (error) => {
                    console.error('Error getting current location:', error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Unable to get your current location. Please enter coordinates manually.',
                            variant: 'error'
                        })
                    );
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Geolocation is not supported by your browser. Please enter coordinates manually.',
                    variant: 'error'
                })
            );
        }
    }

    dispatchLocationChangeEvent() {
        // Dispatch an event to notify the parent component of the location change
        this.dispatchEvent(new CustomEvent('locationchange', {
            detail: {
                latitude: this._latitude,
                longitude: this._longitude
            }
        }));
    }
}
