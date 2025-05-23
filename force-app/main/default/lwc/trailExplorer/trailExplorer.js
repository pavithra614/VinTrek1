import { LightningElement, wire, track } from 'lwc';
import getTrails from '@salesforce/apex/TrailController.getTrails';

export default class TrailExplorer extends LightningElement {
    @track trails = [];
    @track error;
    @track selectedTrail;
    @track isLoading = true;
    @track filterOptions = {
        difficulty: 'All',
        minDistance: 0,
        maxDistance: 100
    };

    difficultyOptions = [
        { label: 'All', value: 'All' },
        { label: 'Easy', value: 'Easy' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'Difficult', value: 'Difficult' },
        { label: 'Very Difficult', value: 'Very Difficult' }
    ];

    @wire(getTrails)
    wiredTrails({ error, data }) {
        this.isLoading = false;
        if (data) {
            this.trails = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.trails = [];
        }
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
        // This would be implemented to filter trails based on criteria
        // For now, this is a placeholder
    }

    handleTrailSelect(event) {
        const trailId = event.currentTarget.dataset.id;
        this.selectedTrail = this.trails.find(trail => trail.Id === trailId);
    }
}