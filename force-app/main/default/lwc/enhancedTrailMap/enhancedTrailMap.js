import { LightningElement, api, track, wire } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTrailDetails from '@salesforce/apex/TrailMapController.getTrailDetails';
import getNearbyCampsites from '@salesforce/apex/TrailMapController.getNearbyCampsites';

// Static resources
import leaflet from '@salesforce/resourceUrl/leaflet';
import leafletElevation from '@salesforce/resourceUrl/leafletElevation';

export default class EnhancedTrailMap extends LightningElement {
    @api trailId;
    @api showElevationProfile = true;
    @api showNearbyPoints = true;
    @api mapHeight = '500px';

    @track isLoading = true;
    @track error;
    @track trail;
    @track campsites = [];

    // Computed property for map style
    get mapStyle() {
        return `height: ${this.mapHeight}`;
    }

    // Computed property for difficulty class
    get difficultyClass() {
        if (!this.trail || !this.trail.Difficulty__c) {
            return 'difficulty-unknown';
        }

        switch(this.trail.Difficulty__c) {
            case 'Easy':
                return 'difficulty-easy';
            case 'Moderate':
                return 'difficulty-moderate';
            case 'Difficult':
                return 'difficulty-difficult';
            case 'Very Difficult':
                return 'difficulty-very-difficult';
            default:
                return 'difficulty-unknown';
        }
    }

    map;
    trailLayer;
    elevationControl;
    markersLayer;

    leafletInitialized = false;

    connectedCallback() {
        if (this.trailId) {
            this.loadTrailData();
        }
    }

    @api
    refresh() {
        if (this.trailId) {
            this.loadTrailData();
        }
    }

    @api
    setTrail(trailId) {
        this.trailId = trailId;
        if (this.leafletInitialized) {
            this.loadTrailData();
        }
    }

    renderedCallback() {
        if (!this.leafletInitialized) {
            this.initializeLeaflet();
        }
    }

    initializeLeaflet() {
        Promise.all([
            loadScript(this, leaflet + '/leaflet.js'),
            loadStyle(this, leaflet + '/leaflet.css'),
            loadScript(this, leafletElevation + '/leaflet-elevation.js'),
            loadStyle(this, leafletElevation + '/leaflet-elevation.css')
        ])
        .then(() => {
            this.initializeMap();
            this.leafletInitialized = true;
            if (this.trailId) {
                this.loadTrailData();
            }
        })
        .catch(error => {
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading map',
                    message: error.message,
                    variant: 'error'
                })
            );
        });
    }

    initializeMap() {
        // Get map container
        const mapElement = this.template.querySelector('.map-container');

        // Create map
        this.map = L.map(mapElement, {
            center: [7.8731, 80.7718], // Center of Sri Lanka
            zoom: 8,
            zoomControl: true,
            scrollWheelZoom: true
        });

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // Create layers for trails and markers
        this.trailLayer = L.featureGroup().addTo(this.map);
        this.markersLayer = L.featureGroup().addTo(this.map);

        // Create elevation control if enabled
        if (this.showElevationProfile) {
            this.elevationControl = L.control.elevation({
                position: 'bottomright',
                theme: 'steelblue-theme',
                width: 600,
                height: 125,
                margins: {
                    top: 10,
                    right: 20,
                    bottom: 30,
                    left: 50
                },
                useHeightIndicator: true,
                interpolation: 'linear',
                hoverNumber: {
                    decimalsX: 2,
                    decimalsY: 0,
                    formatter: undefined
                },
                xTicks: undefined,
                yTicks: undefined,
                collapsed: false,
                imperial: false
            }).addTo(this.map);
        }
    }

    loadTrailData() {
        this.isLoading = true;

        getTrailDetails({ trailId: this.trailId })
            .then(result => {
                this.trail = result;
                this.renderTrail();

                if (this.showNearbyPoints) {
                    return getNearbyCampsites({ trailId: this.trailId });
                }
                return [];
            })
            .then(campsites => {
                if (campsites && campsites.length > 0) {
                    this.campsites = campsites;
                    this.renderCampsites();
                }
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.trail = undefined;
                this.campsites = [];
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading trail data',
                        message: error.message,
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    renderTrail() {
        if (!this.trail || !this.trail.Path_Coordinates__c) {
            return;
        }

        // Clear previous trail
        this.trailLayer.clearLayers();

        try {
            // Parse trail coordinates
            const coordinates = JSON.parse(this.trail.Path_Coordinates__c);

            // Create GeoJSON object
            const geoJson = {
                type: 'Feature',
                properties: {
                    name: this.trail.Name,
                    difficulty: this.trail.Difficulty__c
                },
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            };

            // Add trail to map
            const trailStyle = {
                color: this.getDifficultyColor(this.trail.Difficulty__c),
                weight: 5,
                opacity: 0.7
            };

            const trail = L.geoJSON(geoJson, {
                style: trailStyle
            }).addTo(this.trailLayer);

            // Add elevation data if available and elevation profile is enabled
            if (this.showElevationProfile && this.elevationControl) {
                // Add elevation data to the control
                this.elevationControl.clear();
                this.elevationControl.addData(geoJson);
            }

            // Add start and end markers
            if (coordinates.length > 0) {
                const startPoint = coordinates[0];
                const endPoint = coordinates[coordinates.length - 1];

                // Start marker
                L.marker([startPoint[1], startPoint[0]], {
                    icon: L.divIcon({
                        className: 'trail-marker start-marker',
                        html: '<div class="marker-icon start-icon"></div><div class="marker-label">Start</div>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    })
                }).addTo(this.trailLayer);

                // End marker
                L.marker([endPoint[1], endPoint[0]], {
                    icon: L.divIcon({
                        className: 'trail-marker end-marker',
                        html: '<div class="marker-icon end-icon"></div><div class="marker-label">End</div>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    })
                }).addTo(this.trailLayer);
            }

            // Fit map to trail bounds
            this.map.fitBounds(this.trailLayer.getBounds(), {
                padding: [30, 30]
            });
        } catch (error) {
            console.error('Error rendering trail:', error);
        }
    }

    renderCampsites() {
        if (!this.campsites || this.campsites.length === 0) {
            return;
        }

        // Clear previous markers
        this.markersLayer.clearLayers();

        // Add campsite markers
        this.campsites.forEach(campsite => {
            if (campsite.Latitude__c && campsite.Longitude__c) {
                const marker = L.marker([campsite.Latitude__c, campsite.Longitude__c], {
                    icon: L.divIcon({
                        className: 'campsite-marker',
                        html: '<div class="marker-icon campsite-icon"></div><div class="marker-label">' + campsite.Name + '</div>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    })
                }).addTo(this.markersLayer);

                // Add popup with campsite info
                marker.bindPopup(`
                    <div class="campsite-popup">
                        <h3>${campsite.Name}</h3>
                        <p>${campsite.Description__c || 'No description available'}</p>
                        <p><strong>Daily Fee:</strong> $${campsite.Daily_Fee__c || 'N/A'}</p>
                        <p><strong>Capacity:</strong> ${campsite.Capacity__c || 'N/A'}</p>
                        <button class="view-campsite-btn" data-id="${campsite.Id}">View Details</button>
                    </div>
                `);

                // Add click event to popup buttons
                marker.on('popupopen', () => {
                    setTimeout(() => {
                        const popupContent = marker.getPopup().getElement();
                        if (popupContent) {
                            const viewBtn = popupContent.querySelector('.view-campsite-btn');
                            if (viewBtn) {
                                viewBtn.addEventListener('click', () => {
                                    this.handleCampsiteClick(campsite.Id);
                                });
                            }
                        }
                    }, 100);
                });
            }
        });
    }

    getDifficultyColor(difficulty) {
        switch(difficulty) {
            case 'Easy':
                return '#04844b'; // Green
            case 'Moderate':
                return '#ffb75d'; // Orange
            case 'Difficult':
                return '#e57373'; // Red
            case 'Very Difficult':
                return '#c62828'; // Dark Red
            default:
                return '#1589ee'; // Blue
        }
    }

    handleCampsiteClick(campsiteId) {
        // Dispatch event to parent component
        this.dispatchEvent(new CustomEvent('campsiteselect', {
            detail: { campsiteId: campsiteId }
        }));
    }
}
