import { LightningElement, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getRecommendedTrails from '@salesforce/apex/TrailRecommendationController.getRecommendedTrails';
import userId from '@salesforce/user/Id';

export default class TrailRecommendations extends LightningElement {
    @track recommendations = [];
    @track isLoading = true;
    @track error;
    
    connectedCallback() {
        this.loadRecommendations();
    }
    
    loadRecommendations() {
        this.isLoading = true;
        getRecommendedTrails({ userId: userId })
            .then(result => {
                this.recommendations = result.map(trail => ({
                    ...trail,
                    imageUrl: trail.Image_URL__c ? trail.Image_URL__c : '/resource/default_trail_image',
                    difficultyClass: this.getDifficultyClass(trail.Difficulty__c)
                }));
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.recommendations = [];
                console.error('Error loading recommendations', error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    getDifficultyClass(difficulty) {
        switch(difficulty) {
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
    
    handleTrailSelect(event) {
        const trailId = event.currentTarget.dataset.id;
        // Dispatch event to parent component
        this.dispatchEvent(new CustomEvent('trailselect', {
            detail: { trailId: trailId }
        }));
    }
    
    handleRefresh() {
        this.loadRecommendations();
    }
}
